var gulp = require('gulp');
var sass = require('gulp-sass')(require('sass'));
var concat = require('gulp-concat');
var autoprefixer = require('gulp-autoprefixer');
var uglify = require('gulp-uglify');
var gcmq = require('gulp-group-css-media-queries');
var {
  src,
  dest,
  watch,
  parallel,
  series
} = require('gulp');
var imagemin = require('gulp-imagemin');
var del = require('del');
var browserSync = require('browser-sync').create();
var svgSprite = require('gulp-svg-sprite');
var cheerio = require('gulp-cheerio');
var replace = require('gulp-replace');

/*конвертация файлов .html*/
function browsersync() {
  browserSync.init({
    server: {
      baseDir: "app/"
    },
    notify: false
  })
}

/*конвертация файлов .scss*/
function styles() {
  return src('app/scss/style.scss')
    .pipe(sass({
      outputStyle: 'compressed'
    }))
     .pipe(concat('style.min.css'))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 versions'],
      grid: true
    }))
    .pipe(gcmq()) // в полученном css группируем множество медиа-выражений в общие.
    .pipe(dest('app/css'))
    .pipe(browserSync.stream())
}

/*конвертация файлов .js*/
function scripts() {
  return src([
      'node_modules/jquery/dist/jquery.js',
      'node_modules/slick-carousel/slick/slick.js',
       'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.js',
       'node_modules/rateyo/src/jquery.rateyo.js',
       'node_modules/ion-rangeslider/js/ion.rangeSlider.js',
       'node_modules/jquery-form-styler/dist/jquery.formstyler.js',
       'node_modules/mixitup/dist/mixitup.js',
      'app/js/main.js'
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}

/*конвертация файлов картинок*/
function images() {
  return src('app/images/**/*.*')
    .pipe(imagemin([
      imagemin.gifsicle({
        interlaced: true
      }),
      imagemin.mozjpeg({
        quality: 75,
        progressive: true
      }),
      imagemin.optipng({
        optimizationLevel: 5
      }),
      imagemin.svgo({
        plugins: [{
            removeViewBox: true
          },
          {
            cleanupIDs: false
          }
        ]
      })
    ]))
    .pipe(dest('dist/images'))
}

/*конвертация файлов иконок svg в спрайт*/
/* function svgSprites() {
  return src('app/images/icons/*.svg') // выбираем в папке с иконками все файлы с расширением svg
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: '../sprite.svg', // указываем имя файла спрайта и путь
          },
        },
      })
    )
		.pipe(dest('app/images')); // указываем, в какую папку поместить готовый файл спрайта
} */
/* дубль нижнего - код ментора

function svgSprites() {
  return src('app/images/icons/*.svg') 
  .pipe(svgSprite({
       mode:{
         strack:{
           sprite:"../sprite.svg"  
         }
       },
       shape:{
         transform:[
           {
             svgo:{
               plugins:[
                 {removeXMLNS:true},
               ]
             }
           }
         ]
       }
  }))	     
	.pipe(dest('app/images'))
} */

function svgSprites() {
  return src('app/images/icons/*.svg') 
  .pipe(cheerio({
        run: ($) => {
            $("[fill]").removeAttr("fill"); // очищаем цвет у иконок по умолчанию, чтобы можно было задать свой
            $("[stroke]").removeAttr("stroke"); // очищаем, если есть лишние атрибуты строк
            $("[style]").removeAttr("style"); // убираем внутренние стили для иконок
        },
        parserOptions: { xmlMode: true },
      })
  )
	.pipe(
	      svgSprite({
	        mode: {
	          stack: {
	            sprite: '../sprite.svg', 
	          },
	        },
	      })
	    )
	.pipe(dest('app/images')); 
}

function build() {
  return src([
    'app/**/*.html',
    'app/css/style.min.css',
    'app/js/main.min.js'
  ], {base: 'app'})
  .pipe(dest('dist'))
}

function cleanDist() {
  return del('dist')
}

function watching() {
  watch(['app/scss/**/*.scss'], styles);
  watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
  watch(['app/**/*.html']).on('change', browserSync.reload);
  watch(['app/images/icons/*.svg'], svgSprites);
}

/*вызов функции*/
exports.styles = styles;
exports.scripts = scripts;
exports.browsersync = browsersync;
exports.watching = watching;
exports.images = images;
exports.svgSprites = svgSprites;
exports.cleanDist = cleanDist;

exports.build = series(cleanDist, images, build);

exports.default = parallel(styles, svgSprites, scripts, styles, browsersync, watching);

/*gulp-concat*/
/* gulp.task('scripts', function() {
  return gulp.src('./lib/*.js')
    .pipe(concat('all.js'))
    .pipe(gulp.dest('./dist/'));
}); */

/*gulp-autoprefixe*/
/*exports.default = () => (
	gulp.src('src/app.css')
		.pipe(autoprefixer({
			cascade: false
		}))
		.pipe(gulp.dest('dist'))
);*/

/*gulp-uglify*/
/*gulp.task('compress', function () {
  return pipeline(
        gulp.src('lib/*.js'),
        uglify(),
        gulp.dest('dist')
  );
});*/

// Static Server + watching scss/html files
/* gulp.task('serve', ['sass'], function () {

  browserSync.init({
    server: "./app"
  });

  gulp.watch("app/scss/*.scss", ['sass']);
  gulp.watch("app/*.html").on('change', browserSync.reload);
}); */

// Compile sass into CSS & auto-inject into browsers
/* gulp.task('sass', function () {
  return gulp.src("app/scss/*.scss")
    .pipe(sass())
    .pipe(gulp.dest("app/css"))
    .pipe(browserSync.stream());
});

gulp.task('default', ['serve']); */