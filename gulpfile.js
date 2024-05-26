const { watch } = require('gulp')
const browserSync = require('browser-sync').create()

const routesForLocalDev = {
  '/about': 'public/about.html',
  '/command-a': 'public/command-a.html',
  '/dies-alone': 'public/dies-alone.html',
  '/drawings': 'public/drawings.html',
  '/publications': 'public/publications.html',
  '/software': 'public/software.html',
  '/the-character': 'public/the-character.html',
  '/done-feelin': 'public/done-feelin.html',
  '/': 'public/index.html',
}

const reload = (done) => {
  browserSync.reload()
  done()
}

// Watching files
const watchFiles = () => {
  watch('public/css/*', reload)
  watch('public/img/*', reload)
  watch('public/*.html', reload)
  watch('public/js/*.js', reload)
}

// Serving files
const serve = () => {
  browserSync.init({
    port: 8081,
    server: {
      baseDir: 'public',
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
