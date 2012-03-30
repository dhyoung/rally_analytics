{AnalyticsQuery} = require('../')
XMLHttpRequest = require('node-XMLHttpRequest').XMLHttpRequest

config =
  'X-RallyIntegrationName': 'My Chart'
  'X-RallyIntegrationVendor': 'My Company'
  'X-RallyIntegrationVersion': '0.1.0'
  # Get workspaceOID, username, and password from environment variables
  # RALLY_WORKSPACE, RALLY_USER, and RALLY_PASSWORD

query = new AnalyticsQuery(config, XMLHttpRequest)

query.find({FormattedID:"S34854"})
     .fields(true)
     .debug()

callback = () ->
  console.log(this.allResults)  

query.getAll(callback)