module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-cmd-transport');
    grunt.loadNpmTasks('grunt-cmd-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-template-html');
    grunt.loadNpmTasks('grunt-postcss');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-qunit');

    var transport = require('grunt-cmd-transport');

    var style = transport.style.init(grunt);
    var text = transport.text.init(grunt);
    var script = transport.script.init(grunt);
    //connect端口
    var connectPort = 9000;

    require('time-grunt')(grunt);

    var option = {
        pkg: grunt.file.readJSON("package.json"),
        copy: {
            options: {
                paths: ['src']
            },
            all: {
                files: [{
                    expand: true,
                    cwd: 'src/resources',
                    src: ['**/*', '!less/**/*'],
                    dest: 'dist/resources',
                    flatten: false
                }, {
                    expand: true,
                    cwd: 'src/lib',
                    src: ['**/sea.js', '**/jquery*.js', '**/es5*.*'],
                    dest: 'dist/lib'
                }, {
                    expand: true,
                    cwd: 'src/plugins',
                    src: ['**/**/*.png', '**/**/*.gif'],
                    dest: 'dist/plugins',
                    filter: 'isFile'
                }]
            }
        },
        clean: {
            dist: ['dist'], //清除dist目录
            build: ['.build'] //清除build目录
        },
        less: {
            /**
             * [build 编译所有的less文件，按照模板分类]
             */
            build: {
                files: {
                    "src/resources/css/themes-green.css": ["src/resources/less/themes/green.less"],
                    "src/resources/css/themes-blue.css": ["src/resources/less/themes/blue.less"],
                    "src/resources/css/themes-purple.css": ["src/resources/less/themes/purple.less"],
                    "src/resources/css/themes-orange.css": ["src/resources/less/themes/orange.less"],
                    "src/resources/css/themes-red.css": ["src/resources/less/themes/red.less"],
                    "src/resources/css/page-login.css": ["src/resources/less/pages/login.less"]
                }
            }
        },
        cssmin: {
            options: {
                keepSpecialComments: 0
            },
            /**
             * [build 压缩合并Css文件，分为公共css和模板css]
             * @type {Object}
             */
            build: {
                files: {
                    'src/resources/css/public.css': [
                        'src/lib/vendor/bootstrap/css/bootstrap.css',
                        'src/lib/vendor/uniform/css/uniform.default.css',
                        'src/lib/vendor/font-awesome/css/font-awesome.min.css'
                    ],
                    'src/resources/css/themes-green.css': ['src/resources/css/themes-green.css'],
                    'src/resources/css/themes-blue.css': ['src/resources/css/themes-blue.css'],
                    'src/resources/css/themes-purple.css': ['src/resources/css/themes-purple.css'],
                    'src/resources/css/themes-orange.css': ['src/resources/css/themes-orange.css'],
                    'src/resources/css/themes-red.css': ['src/resources/css/themes-red.css'],
                    'src/resources/css/page-login.css': ['src/resources/css/page-login.css']
                }
            }
        },
        postcss: {
            options: {
                map: false,
                processors: [
                    require('autoprefixer')({
                        browsers: 'last 2 versions',
                        remove: false
                    })
                ]
            },
            dist: {
                src: 'src/resources/css/*.css'
            }
        },
        jshint: {
            options: {
                jshintrc: true
            },
            files: [
                'src/modules/**/*.js',
                'src/widgets/**/*.js',
                'src/plugins/**/module.js',
                'src/lib/**/*.js',
                '!src/lib/vendor/**/*.js'
            ]
        },
        transport: {
            options: {
                debug: false,
                paths: ['src'],
                alias: '<%= pkg.spm.alias %>',
                parsers: {
                    '.js': [script.jsParser],
                    '.css': [style.css2jsParser],
                    '.tpl': [text.html2jsParser],
                    '.html': [text.html2jsParser]
                }
            },
            all: {
                options: {
                    idleading: ""
                },
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: [
                        '**/*',
                        '!resources/**',
                        '!templates/**',
                        '!**/sea*.js'
                    ],
                    filter: 'isFile',
                    dest: '.build'
                }]
            }
        },
        concat: {
            options: {
                paths: ['.'],
                include: 'relative',
                uglify: true
            },
            modules: {
                files: [{
                    expand: true,
                    cwd: '.build/',
                    src: [
                        '**/modules/**/app.js',
                        '**/echarts/loader.js',
                        '**/echarts/loader-map.js'
                    ],
                    dest: 'dist/',
                    ext: '.js'
                }]
            }
        },
        uglify: {
            /**
             * [seajs 合并Seajs扩展文件，并混淆压缩]
             */
            seajs: {
                files: {
                    "src/lib/vendor/sea.js": ["src/lib/vendor/seajs/*.js"]
                }
            }
        },
        /**
         * [handlebars template]
         */
        template: {
            dev: {
                engine: 'handlebars',
                cwd: 'src/templates/',
                partials: [
                    'src/templates/fixtures/*',
                    'src/templates/codes/*',
                    'src/templates/layouts/*'
                ],
                data: 'src/templates/data.json',
                options: {},
                files: [{
                    expand: true,
                    cwd: 'src/templates/',
                    src: ['*.hbs'],
                    dest: 'dist/templates',
                    ext: '.html'
                }]
            }
        },
        // Create a local web server for testing http:// URIs.
        connect: {
            root_server: {
                options: {
                    port: connectPort,
                    base: '.',
                }
            }
        },
        // Unit tests.
        qunit: {
            allTest: {
                options: {
                    urls: [
                        'http://localhost:' + connectPort + '/test/index.html'
                    ]
                }
            }
        }
    };


    //生产发布的Task
    var task_default = [];

    task_default.push("clean:dist");
    task_default.push("transport:all");
    task_default.push("copy:all");
    task_default.push("concat:modules");
    task_default.push("clean:build");
    task_default.push("template");


    grunt.initConfig(option);


    grunt.registerTask('seajs', ['uglify:seajs']);
    grunt.registerTask('check', ['jshint', 'connect', 'qunit']);
    grunt.registerTask('css', ['less:build', 'cssmin:build', 'postcss', 'copy:all']);
    grunt.registerTask('tpl', ['template', "copy:all"]);
    grunt.registerTask('cp', ['copy:all']);

    grunt.registerTask('default', task_default);

};
