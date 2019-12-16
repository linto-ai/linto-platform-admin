const DBmodel = require(`${process.cwd()}/model/${process.env.BDD_TYPE}`)
const model = new DBmodel()

module.exports = (webServer) => {
  return [{
    path: '/fleet',
    method: 'get',
    //requireAuth: true,
    controller: async (req, res, next) => {
      try {
        const getLintos = await model.getLintoFleet()
        res.json(getLintos)
      } catch (error) {
        console.error(error)
        res.json({ error })
      }
    }
  }]
}