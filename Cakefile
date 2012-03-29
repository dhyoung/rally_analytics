fs            = require('fs')
path          = require('path')
{print}       = require('sys')
{spawn, exec} = require('child_process')
async         = require('async')
fs = require('fs')
path = require('path')
jsp = require("uglify-js").parser
pro = require("uglify-js").uglify

deployHTMLFromDirectory = (directory, uglify = true) ->
  contents = fs.readdirSync(directory)
  placeholders = {}
  files = ("#{file}" for file in contents when (file.indexOf('.html') > 0))

  deployDirectory = path.join(__dirname, 'deploy')  
  unless path.existsSync(deployDirectory)
    fs.mkdirSync(deployDirectory, '755')

  for fileName in files
    fullPath = path.join(directory, fileName)
    htmlFileString = fs.readFileSync(fullPath, 'utf-8')
    rString = '<script +type="text/javascript" +src="([-_a-z0-9A-Z/\.]+)"( +deploy_src="([-_:a-z0-9A-Z/\.]+)" *>)'
    r = new RegExp(rString)
    rOutput = r.exec(htmlFileString)
    while rOutput?
      htmlFileString = htmlFileString.replace(rOutput[0], "<script type=\"text/javascript\" src=\"#{rOutput[3]}\">")
      rOutput = r.exec(htmlFileString)
    
    r2String = '<script +type="text/javascript" +src="([-_a-z0-9A-Z/\.]+)" *>'
    r2 = new RegExp(r2String)
    r2Output = r2.exec(htmlFileString)
    while r2Output?
      jsFileName = r2Output[1]
      jsFullPath = path.join(directory, jsFileName)
      if path.existsSync(jsFullPath)
        jsFileString = fs.readFileSync(jsFullPath, 'utf-8')
        if jsFileString?
          if uglify   
            ast = jsp.parse(jsFileString)
            ast = pro.ast_mangle(ast)
            ast = pro.ast_squeeze(ast)
            jsFileString = pro.gen_code(ast)
          htmlFileString = htmlFileString.replace(r2Output[0], "\n<script type=\"text/javascript\">\n#{jsFileString}\n")
      else
        console.log("\nWARNING: Could not find local file #{jsFileName} referenced from #{fileName}. \n    Your deploy file may still work if it's optional or if the file can be found relative to the web address.")
        key = Math.floor(Math.random() * 9999999999)
        placeholders[key] = r2Output[0]
        htmlFileString = htmlFileString.replace(r2Output[0], "***PLACEHOLDER" + key + 'PLACEHOLDER***')
      r2Output = r2.exec(htmlFileString)
            
    # get rid of placeholder stuff
    for key, value of placeholders
      htmlFileString = htmlFileString.replace("***PLACEHOLDER" + key + 'PLACEHOLDER***', value)

    basename = path.basename(fileName, '.html')
    if uglify
      outputFileFullPath = path.join(deployDirectory, basename + '-min.html')
    else
      outputFileFullPath = path.join(deployDirectory, fileName)
    fs.writeFileSync(outputFileFullPath, htmlFileString)
    
task('deploy', 'Combine local .js with .html from ./src and ./examples; then output to ./deploy', () -> 
  invoke('compile') 
  deployHTMLFromDirectory(path.join(__dirname, 'src'), false) 
  deployHTMLFromDirectory(path.join(__dirname, 'examples'), false)
  deployHTMLFromDirectory(path.join(__dirname, 'src')) 
  deployHTMLFromDirectory(path.join(__dirname, 'examples'))
)

run = (command, options, next) ->
  if options? and options.length > 0
    command += ' ' + options.join(' ')
  exec(command, (error, stdout, stderr) ->
    if stderr.length > 0
      console.log("Stderr exec'ing command '#{command}'...\n" + stderr)
    if error?
      console.log('exec error: ' + error)
    if next?
      next(stdout)
    else
      if stdout.length > 0
        console.log("Stdout exec'ing command '#{command}'...\n" + stdout)
  )

task('compile', 'Compile CS to JS and place in ./lib. Good for development.', () ->
  options = ['-c', '-o', 'lib', 'src']
  run('coffee', options)
)

task('watch', 'Recompile CoffeeScript source files when modified and place in ./lib', () ->
    options = ['src', 'lib']
    run('jitter', options)
)

task('docs', 'Generate docs with CoffeeDoc and place in ./docs', () ->
  fs.readdir('src', (err, contents) ->
    files = ("#{file}" for file in contents when (file.indexOf('.coffee') > 0))

    # Make sure the file with the same name as the project (directory) is at the beginning
    projectCoffeeFile =  path.basename(__dirname) + '.coffee'
    srcPlus = "#{projectCoffeeFile}"
    position = files.indexOf(srcPlus)
    if position > 0
      files = [srcPlus].concat(files[0..position-1], files[position+1..files.length-1])

    process.chdir(__dirname + '/src')
    run('coffeedoc', ['-o', '../docs', '--readme', '-r', '../README.md'].concat(files), () ->
      # async.concat(files, fs.readFile, (err, fileArray) ->
      #   process.chdir(__dirname)
      #   pathName = './docs/annotated_source.coffee'
      #   fs.writeFile(pathName, fileArray.join('\n\n'), () ->
      #     options = [pathName]
      #     run('docco', options, () ->
      #       fs.unlink(pathName)
      #     )
      #   )
      # )
    )
    
    process.chdir(__dirname)
    run('coffeedoctest', ['--readme', '--requirepath', 'src', 'src'])
  )
)

task('pub-docs', 'Push master to gh-pages on github', () ->
  process.chdir(__dirname)
  run('git push -f origin master:gh-pages')
)

# task('install', 'Install globally but from this source using npm', () ->
#   process.chdir(__dirname)
#   run('npm install -g .')
# )

# task('publish', 'Publish to npm', () ->
#   process.chdir(__dirname)
#   run('npm publish .')
# )

task('test', 'Run the test suite with nodeunit', () ->
  {reporters} = require 'nodeunit'
  process.chdir __dirname
  reporters.default.run ['test']
)

option('-n', '--name [NAME]', 'name of project to create')

task('create', 'Creates a new directory with the recommended structure', (options) ->
  name = options.name
  console.log(name)
  fs.mkdir(name)
  fs.mkdir(name + '/src')
  fs.mkdir(name + '/test')
  fs.mkdir(name + '/node_modules')
  
  fs.readdir(name, (err, files) -> 
    if 'package.json' in files
      console.log('package.json already exists')
    else
      run('system_profiler SPSoftwareDataType', [], (stdout) ->
        matcher = /User Name: ([\w\s]+) \(/
        groups = matcher.exec(stdout)
        packageJSON = """{
          "name": "#{name}",
          "description": "",
          "version": "0.1.0",
          "author": "#{groups[1]}",
          "dependencies": {},
          "devDependencies": {}
        }"""
        fs.writeFileSync(name + '/package.json', packageJSON)
      )
      
    if 'Cakefile' in files
      console.log('Cakefile already exists')
    else
      fs.linkSync('Cakefile', name + '/Cakefile')
      
    if '.gitignore' in files
      console.log('.gitignore already exists')
    else
      gitignore = """
      coffeedoctest_temp
      .DS_Store
      """
      fs.writeFileSync(name + '/.gitignore', gitignore)
    
    if 'index.html' in files
      console.log('index.html already exists')
    else
      indexHtml = """
      <!DOCTYPE html>
      <html>
      <head>
      <meta http-equiv="Refresh" content="0; url=http:docs/index.html" />
      </head>
      <body>
      <p>Please follow <a href="http:docs/index.html">this link</a>.</p>
      </body>
      </html>
      """
      fs.writeFileSync(name + '/index.html', indexHtml)
  )
)
