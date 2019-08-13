const { uuid } = require('../htutil')
const chai = require('chai')
const expect = chai.expect

describe('UUID v4', function () {
  it('Should have length equal 14', function () {
    const id = uuid.uuidv4()
    expect(id.length).equal(36)
  })
})
