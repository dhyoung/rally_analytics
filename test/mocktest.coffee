{XHRMock} = require('../mock/XHRMock')

exports.mockTest =

  setUp: (callback) ->
    XHRMock.sendCount = 0
    callback()

  testMock: (test) -> 
    xhr = new XHRMock()
    
    handler = () ->
      test.equal(this.responseText, '''{
      	"_rallyAPIMajor": "1", 
      	"_rallyAPIMinor": "27", 
      	"Errors": [], 
      	"Warnings": [], 
      	"TotalResultCount": 5, 
      	"StartIndex": 0, 
      	"PageSize": 2, 
      	"ETLDate": "2012-03-16T21:01:17.802Z", 
      	"Results": [
      		{"id": 1},
      		{"id": 2}
      	]
      }''')
      
    xhr.onreadystatechange = handler
    xhr.open('GET', 'http://somewhere.com')
    xhr.setRequestHeader('header1', 'value1')
    xhr.send()
    
    test.equal(xhr.method, 'GET')
    test.equal(xhr.url, 'http://somewhere.com')
    test.deepEqual(xhr.headers, {header1: 'value1'})
    
    test.done()