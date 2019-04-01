const BaseToken = artifacts.require('./tokenization/ModularToken.sol');
const BalanceModule = artifacts.require('./tokenization/modules/BalanceModule.sol');
const AllowanceModule = artifacts.require('./tokenization/modules/AllowanceModule.sol');
const RegistryModule = artifacts.require('./tokenization/modules/RegistryModule.sol');
const ConversionReceiver = artifacts.require('./bridge/IOSTConversionReceiver.sol');

module.exports = function deployment(deployer, network, accounts) {
    // eslint-disable-next-line no-unused-vars
    const [owner, admin1, admin2, ...rest] = accounts;

    const deployFn = async () => {
        // Circle USD Dummy
        console.log('\nDeploying BalanceModule');
        const balance = await BalanceModule.new({ from: owner });

        console.log('\nDeploying AllowanceModule');
        const allowance = await AllowanceModule.new({ from: owner });

        console.log('\nDeploying RegistryModule');
        const registry = await RegistryModule.new({ from: owner });

        console.log('\nDeploying BaseToken');
        const token = await BaseToken.new('Circle USD', 'USDC', 18, { from: owner });

        console.log('\nTransfer ownership of BalanceModule to Token');
        await balance.transferOwnership(token.address, { from: owner });

        console.log('\nTransfer ownership of AllowanceModule to Token');
        await allowance.transferOwnership(token.address, { from: owner });

        console.log('\nTransfer ownership of RegistryModule to Token');
        await registry.transferOwnership(token.address, { from: owner });

        console.log('\nSetting token\'s BalanceModule');
        await token.setBalanceModule(balance.address, { from: owner });

        console.log('\nSetting token\'s AllowanceModule');
        await token.setAllowanceModule(allowance.address, { from: owner });

        console.log('\nSetting token\'s RegistryModule');
        await token.setRegistryModule(registry.address, { from: owner });

        // Paxos Sandard Dummy
        console.log('\nDeploying BalanceModule');
        const balance3 = await BalanceModule.new({ from: owner });

        console.log('\nDeploying AllowanceModule');
        const allowance3 = await AllowanceModule.new({ from: owner });

        console.log('\nDeploying RegistryModule');
        const registry3 = await RegistryModule.new({ from: owner });

        console.log('\nDeploying BaseToken');
        const token3 = await BaseToken.new('Paxos Standard', 'PAX', 18, { from: owner });

        console.log('\nTransfer ownership of BalanceModule to Token');
        await balance3.transferOwnership(token3.address, { from: owner });

        console.log('\nTransfer ownership of AllowanceModule to Token');
        await allowance3.transferOwnership(token3.address, { from: owner });

        console.log('\nTransfer ownership of RegistryModule to Token');
        await registry3.transferOwnership(token3.address, { from: owner });

        console.log('\nSetting token\'s BalanceModule');
        await token3.setBalanceModule(balance3.address, { from: owner });

        console.log('\nSetting token\'s AllowanceModule');
        await token3.setAllowanceModule(allowance3.address, { from: owner });

        console.log('\nSetting token\'s RegistryModule');
        await token3.setRegistryModule(registry3.address, { from: owner });
        
        // RTE tokens
        console.log('\nDeploying BalanceModule');
        const balance2 = await BalanceModule.new({ from: owner });

        console.log('\nDeploying AllowanceModule');
        const allowance2 = await AllowanceModule.new({ from: owner });

        console.log('\nDeploying RegistryModule');
        const registry2 = await RegistryModule.new({ from: owner });

        console.log('\nDeploying BaseToken');
        const token2 = await BaseToken.new('Rate3', 'RTE', 18, { from: owner });

        console.log('\nTransfer ownership of BalanceModule to Token');
        await balance2.transferOwnership(token2.address, { from: owner });

        console.log('\nTransfer ownership of AllowanceModule to Token');
        await allowance2.transferOwnership(token2.address, { from: owner });

        console.log('\nTransfer ownership of RegistryModule to Token');
        await registry2.transferOwnership(token2.address, { from: owner });

        console.log('\nSetting token\'s BalanceModule');
        await token2.setBalanceModule(balance2.address, { from: owner });

        console.log('\nSetting token\'s AllowanceModule');
        await token2.setAllowanceModule(allowance2.address, { from: owner });

        console.log('\nSetting token\'s RegistryModule');
        await token2.setRegistryModule(registry2.address, { from: owner });

        console.log('\nSetting converter of BaseToken');
        const converter = await ConversionReceiver.new(
            token.address,
            token2.address,
            new web3.utils.BN('1000000000000000000000'), // 1000 RTE tokens
            0,
            10,
            0,
            5,
            new web3.utils.BN('1000000000000000000'), // 1 token
            admin1,
            admin2,
            { from: owner }
        );

        console.log('\nSetting converter of BaseToken');
        const converter2 = await ConversionReceiver.new(
            token3.address,
            token2.address,
            new web3.utils.BN('1000000000000000000000'), // 1000 RTE tokens
            0,
            10,
            0,
            5,
            new web3.utils.BN('1000000000000000000'), // 1 token
            admin1,
            admin2,
            { from: owner }
        );

        // mint 1 million tokens for testing
        token.mint(owner, new web3.utils.BN('1000000000000000000000000'), { from: owner });
        token3.mint(owner, new web3.utils.BN('1000000000000000000000000'), { from: owner });

        console.log('\n===== Addresses ======');
        console.log('USDC AllowanceModule:    ', allowance.address);
        console.log('USDC BalanceModule:      ', balance.address);
        console.log('USDC RegistryModule:     ', registry.address);
        console.log('USDC Token:              ', token.address);
        console.log('PAX AllowanceModule:    ', allowance3.address);
        console.log('PAX BalanceModule:      ', balance3.address);
        console.log('PAX RegistryModule:     ', registry3.address);
        console.log('PAX Token:              ', token3.address);
        console.log('RTE AllowanceModule:', allowance2.address);
        console.log('RTE BalanceModule:  ', balance2.address);
        console.log('RTE RegistryModule: ', registry2.address);
        console.log('RTE Token:          ', token2.address);
        console.log('IUSDC Converter:          ', converter.address);
        console.log('IPAX Converter:          ', converter2.address);
        console.log('======================\n');

        console.log('\n===== Admins ======');
        console.log('Owner:          ', owner);
        console.log('Admin1:         ', admin1);
        console.log('Admin2:         ', admin2);
        console.log('======================\n');
    };

    return deployer.then(() => deployFn()).catch(console.error);
};
