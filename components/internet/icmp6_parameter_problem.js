import Icmp6Error from './icmp6_error.js';

export default class Icmp6ParameterProblem extends Icmp6Error {
  get defaultType() {
    return 4; // Type: Parameter Problem
  }
}