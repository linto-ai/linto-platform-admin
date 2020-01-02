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
  },
  {
    path: '/fleet',
    method: 'post',
    //requireAuth: true,
    controller: async (req, res, next) => {
      try {
        const sn = req.body.sn
        let addLinto = await model.addLintoFleet(sn)
        if (addLinto === 'success') {
          res.json({
            status: 'success',
            msg: `A LinTO has been added with serial number "${sn}"`
          })
        } else {
          throw 'Error on adding a new LinTO'
        }
      } catch (error) {
        console.error(error)
        res.json({
          status: 'error',
          msg: error
        })
      }
    }
  }]
}