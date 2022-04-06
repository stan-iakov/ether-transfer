// https://eth-ropsten.alchemyapi.io/v2/KEJ1luVZjExrdevhJ-irlZjup3X9HWKk

require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    ropsten: {
      url: 'https://eth-ropsten.alchemyapi.io/v2/KEJ1luVZjExrdevhJ-irlZjup3X9HWKk',
      accounts: ['d0436d5bcb0f90331162695ccbc5450fa9b0641891ad0086003e70f9017980c3']
    }
  }
}