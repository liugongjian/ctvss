import { create, all } from 'mathjs'

const config = {
  epsilon: 1e-12,
  matrix: 'Matrix',
  number: 'number',
  precision: 64,
  predictable: false,
  randomSeed: undefined
}
const math = create(all, config)
export default math
