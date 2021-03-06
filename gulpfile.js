// guLp组件区域
var gulp = require('gulp'),
  watch = require('gulp-watch'), //监听
  rollup = require('gulp-rollup'), // 集成的rollup
  babel = require('gulp-babel'), // babel编译
  eslint = require('gulp-eslint'); // 语法检查

// 以下rollup组件
var replace = require('rollup-plugin-replace'); // 可在源码中读取环境变量


var path = {
  entry: {
    deneui: './src/nodeui/**/*.js',
  },
  dist: 'dist',
};

// 开发环境-需要处理编译的
function builddev() {
  // 监听文件
  return watch(path.entry.deneui, {ignoreInitial:false}, function () {
    gulp.src(path.entry.deneui)
      .pipe(babel({
        babelrc:false, // 外部.babelrc设置的参数无效
        'plugins': ['transform-es2015-modules-commonjs'] // 编译成ES5
      }))
      .pipe(gulp.dest(path.dist));
  });
}

// 线上环境需要处理的
function buildprod() {
  return gulp.src(path.entry.deneui)
  .pipe(babel({
    babelrc:false, // 外部.babelrc设置的参数无效
    ignore: ['./src/nodeui/config/*.js'], // 忽略此文件夹下面的所有js文件
    'plugins': ['transform-es2015-modules-commonjs'] // 编译成ES5
  }))
  .pipe(gulp.dest(path.dist));
}

// 清洗node配置文件
function buildconfig() {
  return gulp.src(path.entry.deneui) // 要是所有文件夹，不然输出不会显示目录
  .pipe(rollup({
    input: './src/nodeui/config/index.js', // rollup入口文件
    output:{
      // 产出文件使用umd规范（即兼容 amd cjs 和 iife）
      format: 'cjs', // node只用cjs即可
    },
    plugins: [
      replace({
        // 设置全局环境变量为 线上环境，清理生产环境代码
        'process.env.NODE_ENV': JSON.stringify('production'),
      })
    ]
  }))
  .pipe(gulp.dest(path.dist));

}

// 代码规范检查
function buildlint(){
  return gulp.src(path.entry.deneui)
  .pipe(eslint()) // 语法检查
  .pipe(eslint.format()) // 语法错误显示
  .pipe(eslint.failAfterError());
}


let build = gulp.series(builddev); // 默认走开发环境编译
// 判断环境设置不同运行机制
if(process.env.NODE_ENV == 'production'){
  build = gulp.series(buildprod,buildconfig);
}
if(process.env.NODE_ENV == 'lint'){
  build = gulp.series(buildlint);
}

// 默认任务配置
gulp.task('default', build);
