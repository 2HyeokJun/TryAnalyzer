const express = require('express');
const damage_taken = require('./damage-taken.json');
const damage_done = require('./damage-done.json');

const app = express()
const port = 3000

app.get('/damage-taken', (req, res) => {
    let melee  = [];
    for (element of damage_taken.events) {
        if (element.ability.guid === 396023) {
            melee.push(element);
        }
    }
    res.send({
        length: melee.length,
        data: melee,
    });
    // res.send(damage_taken)
})

app.get('/damage-done', (req, res) => {
    let melee  = [];
    for (element of damage_done.events) {
        if (element.ability.guid === 1) {
            melee.push(element);
        }
    }
    res.send({
        length: melee.length,
        data: melee,
    });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})