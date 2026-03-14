const express = require('express')
const db = require('../config/database')
const { protect } = require('../middleware/auth')

const router = express.Router()

router.use(protect)

router.get('/summary', async (req, res) => {
try {

```
const total = await db.query('SELECT COUNT(*) FROM leads')
const totalLeads = parseInt(total.rows[0].count)

const newLeadsResult = await db.query(
  "SELECT COUNT(*) FROM leads WHERE status='new'"
)

const contactedResult = await db.query(
  "SELECT COUNT(*) FROM leads WHERE status='contacted'"
)

const convertedResult = await db.query(
  "SELECT COUNT(*) FROM leads WHERE status='converted'"
)

const newLeads = parseInt(newLeadsResult.rows[0].count)
const contactedLeads = parseInt(contactedResult.rows[0].count)
const convertedLeads = parseInt(convertedResult.rows[0].count)

const conversionRate =
  totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0

res.json({
  success: true,
  data: {
    totalLeads,
    newLeads,
    contactedLeads,
    convertedLeads,
    conversionRate
  }
})
```

} catch (error) {
console.error(error)
res.status(500).json({
success: false,
message: 'Server Error'
})
}
})

module.exports = router
