const _ = require(`lodash`)
const glob = require(`glob`)
const fs = require(`fs-extra`)

const { store, emitter } = require(`../../redux/`)
import {
  layoutComponentChunkName,
  pathChunkName,
} from "../../utils/js-chunk-names"

import { joinPath } from "../../utils/path"

// Write out pages information.
const writePages = async () => {
  writtenOnce = true
  let { program, config, pages, layouts } = store.getState()

  // Write out pages.json
  const pagesData = pages.reduce(
    (mem, { path, matchPath, componentChunkName, layout, jsonName }) => [
      ...mem,
      { componentChunkName, layout, jsonName, path, matchPath },
    ],
    []
  )

  // Get list of components, layouts, and json files.
  let components = []
  let json = []
  let pageLayouts = []

  pages.forEach(p => {
    components.push({
      componentChunkName: p.componentChunkName,
      component: p.component,
    })
    if (p.layout) {
      let layout = _.find(layouts, ['path', p.layout])
      pageLayouts.push(layout)
    } else {
      let layout = _.find(layouts, ['path', 'index'])
      layout && pageLayouts.push(layout)
    }
    json.push({ path: p.path, jsonName: p.jsonName })
  })

  // Add the default layout if it exists.
  let defaultLayoutExists = false

  pageLayouts = _.uniq(pageLayouts)
  components = _.uniqBy(components, c => c.componentChunkName)

  await fs.writeFile(
    joinPath(program.directory, `.cache/pages.json`),
    JSON.stringify(pagesData, null, 4)
  )

  // Create file with sync requires of layouts/components/json files.
  let syncRequires = `// prefer default export if available
const preferDefault = m => m && m.default || m
\n\n`
  syncRequires += `exports.components = {\n${components
    .map(
      c =>
        `  "${c.componentChunkName}": preferDefault(require("${joinPath(
          c.component
        )}"))`
    )
    .join(`,\n`)}
}\n\n`
  syncRequires += `exports.json = {\n${json
    .map(
      j =>
        `  "${j.jsonName}": require("${joinPath(
          program.directory,
          `/.cache/json/`,
          j.jsonName
        )}")`
    )
    .join(`,\n`)}
}\n\n`
  syncRequires += `exports.layouts = {\n${pageLayouts
    .map(l => {
      if (l) {
        console.log(l)
        return (
          `  "${l.path}": preferDefault(require("${joinPath(
            l.component
          )}"))`
        )
      } else {
        return `  "${l}": false`
      }
    })
    .join(`,\n`)}
}`

  await fs.writeFile(
    `${program.directory}/.cache/sync-requires.js`,
    syncRequires
  )
  // Create file with async requires of layouts/components/json files.
  let asyncRequires = `// prefer default export if available
const preferDefault = m => m && m.default || m
\n`
  asyncRequires += `exports.components = {\n${components
    .map(
      c =>
        `  "${c.componentChunkName}": require("gatsby-module-loader?name=${c.componentChunkName}!${joinPath(
          c.component
        )}")`
    )
    .join(`,\n`)}
}\n\n`
  asyncRequires += `exports.json = {\n${json
    .map(
      j =>
        `  "${j.jsonName}": require("gatsby-module-loader?name=${pathChunkName(
          j.path
        )}!${joinPath(program.directory, `/.cache/json/`, j.jsonName)}")`
    )
    .join(`,\n`)}
}\n\n`
  asyncRequires += `exports.layouts = {\n${pageLayouts
    .map(l => {
      let componentName = l
      if (l) {
        componentName = `index`
        return `  "${l.path}": require("gatsby-module-loader?name=${l.componentChunkName}!${joinPath(
          l.component
        )}")`
      } else {
        return `  "${l.path}": false`
      }
    })
    .join(`,\n`)}
}`

  await fs.writeFile(
    joinPath(program.directory, `.cache/async-requires.js`),
    asyncRequires
  )

  return
}

exports.writePages = writePages

let writtenOnce = false
let oldPages
const debouncedWritePages = _.debounce(() => {
  if (!writtenOnce || !_.isEqual(oldPages, store.getState().pages)) {
    writePages()
    oldPages = store.getState().pages
  }
}, 250)

emitter.on(`CREATE_PAGE`, () => {
  debouncedWritePages()
})
emitter.on(`DELETE_PAGE_BY_PATH`, () => {
  debouncedWritePages()
})
