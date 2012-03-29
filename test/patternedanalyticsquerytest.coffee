{XHRMock} = require('../mock/XHRMock')
rally_analytics = require('../')
{AtAnalyticsQuery, BetweenAnalyticsQuery, AtArrayAnalyticsQuery, TimeInStateAnalyticsQuery, PreviousToCurrenAnalyticsQuery} = rally_analytics

basicConfig =
  'X-RallyIntegrationName'     : 'testName'
  'X-RallyIntegrationVendor'   : 'testRally'
  'X-RallyIntegrationVersion'  : '0.1.0'
  workspaceOID: 12345

exports.patternedAnalyticsQueryTest =

  setUp: (callback) ->
    XHRMock.sendCount = 0
    callback()
    
  testConstructor: (test) ->
    config =
      'X-RallyIntegrationName'     : 'testName'
      'X-RallyIntegrationVendor'   : 'testRally'
      'X-RallyIntegrationVersion'  : '0.1.0'
      additionalHeaders: { 
        myHeader: 'myHeader'
      }
      username: 'anyone@anywhere.com' # If left off, will prompt user
      password: 'xxxxx'
      workspaceOID: 12345
    
    query = new AtAnalyticsQuery(config, XHRMock, '2012-01-01T00:00:00.000Z')
    test.equal(query._XHRClass, XHRMock)
    test.ok(query.headers['myHeader']?)
    test.equal(query.headers['X-RallyIntegrationName'], 'testName')
    test.equal(query.headers['X-RallyIntegrationVendor'], 'testRally')
    test.equal(query.headers['X-RallyIntegrationVersion'], '0.1.0')
    test.equal(query.username, 'anyone@anywhere.com')
    test.equal(query.password, 'xxxxx')
    
    test.done()
    
  testThrowsMissingAtDate: (test) ->    
    f = () ->
      query = new AtAnalyticsQuery(basicConfig, XHRMock)
      
    test.throws(f, Error)
    
    test.done()
        
  testGetAllHappy: (test) ->
    test.expect(3)
    query = new BetweenAnalyticsQuery(basicConfig, XHRMock, '2012-01-01T00:00:00.000Z', '2012-04-01T00:00:00.000Z')

    callback = () ->
      expectedText = '''{
      	"_rallyAPIMajor": "1", 
      	"_rallyAPIMinor": "27", 
      	"Errors": [], 
      	"Warnings": [], 
      	"TotalResultCount": 5, 
      	"StartIndex": 4, 
      	"PageSize": 2, 
      	"ETLDate": "2012-03-16T21:01:17.802Z", 
      	"Results": [
      		{"id": 5}
      	]
      }'''
      expectedResponse = JSON.parse(expectedText)
      test.equal(this.lastResponseText, expectedText)
      test.deepEqual(this.lastResponse, expectedResponse)
      test.deepEqual(this.allResults, [
        {id: 1},
        {id: 2},
        {id: 3},
        {id: 4},
        {id: 5}
      ])
      test.done()
      
    query.scope('Project', 1234)
    query.getAll(callback)

    