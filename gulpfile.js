const { watch } = require('gulp')
const browserSync = require('browser-sync').create()

const routesForLocalDev = {
  '/about': 'src/about.html',
  '/command-a': 'src/command-a.html',
  '/dies-alone': 'src/dies-alone.html',
  '/drawings': 'src/drawings.html',
  '/publications': 'src/publications.html',
  '/software': 'src/software.html',
  '/the-character': 'src/the-character.html',
  '/': 'src/index.html',
}

const reload = (done) => {
  browserSync.reload()
  done()
}

// Watching files
const watchFiles = () => {
  watch('src/css/*', reload)
  watch('src/img/*', reload)
  watch('src/*.html', reload)
  watch('src/js/*.js', reload)
}

// Serving files
const serve = () => {
  browserSync.init({
    port: 8081,
    server: {
      baseDir: 'src',
      routes: routesForLocalDev
    }
  })
}

const serveAndWatch = () => {
  watchFiles()
  serve()
}

exports.serve = serve
exports.develop = serveAndWatch
exports.default = serve
