import { BN, constants, expectEvent, time, shouldFail } from 'openzeppelin-test-helpers';

const ModularToken = artifacts.require("./tokenization/tokens/ModularToken.sol");
const BalanceModule = artifacts.require("./tokenization/modules/BalanceModule.sol");
const AllowanceModule = artifacts.require("./tokenization/modules/AllowanceModule.sol");
const RegistryModule = artifacts.require("./tokenization/modules/RegistryModule.sol");

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bn')(BN))
  .should();

contract('Modular Token Tests', function(accounts) {

    before(async function () {
        // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
        await time.advanceBlock();
    });

    const [_, owner, ...rest] = accounts;

    describe('Test - setup modules', function() {
        beforeEach(async function () {
            // Initialize ModularToken contract.
            this.token = await ModularToken.new('BaseToken', 'BT', 18, { from: owner });
        });
        
        describe('balanceModule', function() {
            beforeEach(async function() {
                this.balanceModule = await BalanceModule.new({ from: owner });
                await this.balanceModule.transferOwnership(this.token.address, { from: owner });
                this.allowanceModule = await AllowanceModule.new({ from: owner });
                await this.allowanceModule.transferOwnership(this.token.address, { from: owner });
            });

            it('only owner can set module', async function() {
                await shouldFail.reverting(this.token.setBalanceModule(this.balanceModule.address, { from: rest[0] }));
                await this.token.setBalanceModule(this.balanceModule.address, { from: owner });
            });

            it('functionality breaks when module not set', async function() {
                await shouldFail.reverting(this.token.balanceOf(rest[0]));
            });

            it('functionality breaks when module set incorrectly', async function() {
                await this.token.setBalanceModule(this.allowanceModule.address, { from: owner });
                await shouldFail.reverting(this.token.balanceOf(rest[0]));

                await this.token.setBalanceModule(this.balanceModule.address, { from: owner });
                await this.token.balanceOf(rest[0]);
            });

            it('event emitted', async function() {
                const { logs } = await this.token.setBalanceModule(this.balanceModule.address, { from: owner });

                const event = expectEvent.inLogs(logs, 'BalanceModuleSet', {
                    moduleAddress: this.balanceModule.address
                });
            });
        });

        describe('allowanceModule', function() {
            beforeEach(async function() {
                this.balanceModule = await BalanceModule.new({ from: owner });
                await this.balanceModule.transferOwnership(this.token.address, { from: owner });
                this.allowanceModule = await AllowanceModule.new({ from: owner });
                await this.allowanceModule.transferOwnership(this.token.address, { from: owner });
            });

            it('only owner can set module', async function() {
                await shouldFail.reverting(this.token.setAllowanceModule(this.allowanceModule.address, { from: rest[0] }));
                await this.token.setAllowanceModule(this.allowanceModule.address, { from: owner });
            });

            it('functionality breaks when module not set', async function() {
                await shouldFail.reverting(this.token.allowance(rest[0], rest[1]));
            });

            it('functionality breaks when module set incorrectly', async function() {
                await this.token.setAllowanceModule(this.balanceModule.address, { from: owner });
                await shouldFail.reverting(this.token.allowance(rest[0], rest[1]));

                await this.token.setAllowanceModule(this.allowanceModule.address, { from: owner });
                await this.token.allowance(rest[0], rest[1]);
            });

            it('event emitted', async function() {
                const { logs } = await this.token.setAllowanceModule(this.allowanceModule.address, { from: owner });

                const event = expectEvent.inLogs(logs, 'AllowanceModuleSet', {
                    moduleAddress: this.allowanceModule.address
                });
            });
        });

        describe('registryModule', function() {
            beforeEach(async function() {
                this.balanceModule = await BalanceModule.new({ from: owner });
                await this.balanceModule.transferOwnership(this.token.address, { from: owner });
                this.registryModule = await RegistryModule.new({ from: owner });
                await this.registryModule.transferOwnership(this.token.address, { from: owner });
            });

            it('only owner can set module', async function() {
                await shouldFail.reverting(this.token.setRegistryModule(this.registryModule.address, { from: rest[0] }));
                await this.token.setRegistryModule(this.registryModule.address, { from: owner });
            });

            it('functionality breaks when module not set', async function() {
                await shouldFail.reverting(this.token.getKey(rest[0], 'test'));
            });

            it('functionality breaks when module set incorrectly', async function() {
                await this.token.setRegistryModule(this.balanceModule.address, { from: owner });
                await shouldFail.reverting(this.token.getKey(rest[0], 'test'));

                await this.token.setRegistryModule(this.registryModule.address, { from: owner });
                await this.token.getKey(rest[0], 'test');
            });

            it('event emitted', async function() {
                const { logs } = await this.token.setRegistryModule(this.registryModule.address, { from: owner });

                const event = expectEvent.inLogs(logs, 'RegistryModuleSet', {
                    moduleAddress: this.registryModule.address
                });
            });
        });
    });

    describe('Test - token supply functions', function() {
        beforeEach(async function() {
            this.token = await ModularToken.new('BaseToken', 'BT', 18, { from: owner });

            this.balanceModule = await BalanceModule.new({ from: owner });
            await this.balanceModule.transferOwnership(this.token.address, { from: owner });
            this.allowanceModule = await AllowanceModule.new({ from: owner });
            await this.allowanceModule.transferOwnership(this.token.address, { from: owner });
            this.registryModule = await RegistryModule.new({ from: owner });
            await this.registryModule.transferOwnership(this.token.address, { from: owner });

            await this.token.setBalanceModule(this.balanceModule.address, { from: owner });
            await this.token.setAllowanceModule(this.allowanceModule.address, { from: owner });
            await this.token.setRegistryModule(this.registryModule.address, { from: owner });
        });

        it('only owner can mint', async function() {
            await shouldFail.reverting(this.token.mint(rest[0], new BN(100), { from: rest[0] }));
            await this.token.mint(rest[0], new BN(100), { from: owner });
        });

        it('mint balance updated', async function() {
            // mint 100 first
            await this.token.mint(rest[0], new BN(100), { from: owner });

            (await this.token.balanceOf(rest[0])).should.be.a.bignumber.equals(new BN(100));
        });

        it('mint event emitted', async function() {
            const { logs } = await this.token.mint(rest[0], new BN(100), { from: owner });

            const event1 = expectEvent.inLogs(logs, 'Mint', {
                to: rest[0],
            });

            const event2 = expectEvent.inLogs(logs, 'Transfer', {
                from: constants.ZERO_ADDRESS,
                to: rest[0],
            });
        });

        it('only owner can burn', async function() {
            // mint 100 first
            await this.token.mint(rest[0], new BN(100), { from: owner });

            await shouldFail.reverting(this.token.burn(rest[0], new BN(100), { from: rest[0] }));
            await this.token.burn(rest[0], new BN(100), { from: owner });
        });

        it('cannot burn more than balance', async function() {
            // mint 100 first
            await this.token.mint(rest[0], new BN(100), { from: owner });

            await shouldFail.reverting(this.token.burn(rest[0], new BN(1000), { from: owner }));
            await this.token.burn(rest[0], new BN(100), { from: owner });
        });

        it('burn balance updated', async function() {
            // mint 100 first
            await this.token.mint(rest[0], new BN(100), { from: owner });
            await this.token.burn(rest[0], new BN(50), { from: owner });

            (await this.token.balanceOf(rest[0])).should.be.a.bignumber.equals(new BN(50));
        });

        it('burn event emitted', async function() {
            // mint 100 first
            await this.token.mint(rest[0], new BN(100), { from: owner });

            const { logs } = await this.token.burn(rest[0], new BN(100), { from: owner });

            const event1 = expectEvent.inLogs(logs, 'Burn', {
                from: rest[0],
            });

            const event2 = expectEvent.inLogs(logs, 'Transfer', {
                from: rest[0],
                to: constants.ZERO_ADDRESS,
            });
        });
    });
    
    describe('Test - registry functions', function() {
        beforeEach(async function() {
            this.token = await ModularToken.new('BaseToken', 'BT', 18, { from: owner });

            this.balanceModule = await BalanceModule.new({ from: owner });
            await this.balanceModule.transferOwnership(this.token.address, { from: owner });
            this.allowanceModule = await AllowanceModule.new({ from: owner });
            await this.allowanceModule.transferOwnership(this.token.address, { from: owner });
            this.registryModule = await RegistryModule.new({ from: owner });
            await this.registryModule.transferOwnership(this.token.address, { from: owner });

            await this.token.setBalanceModule(this.balanceModule.address, { from: owner });
            await this.token.setAllowanceModule(this.allowanceModule.address, { from: owner });
            await this.token.setRegistryModule(this.registryModule.address, { from: owner });
        });

        it('only owner can set key data record', async function() {
            await shouldFail.reverting(this.token.setKeyDataRecord(
                rest[0], 'test', 1, 'test string', rest[0], true, rest[1], { from: rest[0] }));
            await this.token.setKeyDataRecord(
                rest[0], 'test', 1, 'test string', rest[0], true, rest[1], { from: owner });
        });

        it('check get data record', async function() {
            await this.token.setKeyDataRecord(
                rest[0], 'test', 1, 'test string', rest[0], true, rest[1], { from: owner });
            const res = await this.token.getDataRecord(rest[0], 'test');
            res[1].should.be.equal('test string');
        });

        it('check get key', async function() {
            await this.token.setKeyDataRecord(
                rest[0], 'test', 1, 'test string', rest[0], true, rest[1], { from: owner });
            const res = await this.token.getKey(rest[0], 'test');
            res.should.be.equal(true);
        });
    });

    describe('Test - sweep function',  function() {
        beforeEach(async function() {
            this.token = await ModularToken.new('BaseToken', 'BT', 18, { from: owner });

            this.balanceModule = await BalanceModule.new({ from: owner });
            await this.balanceModule.transferOwnership(this.token.address, { from: owner });
            this.allowanceModule = await AllowanceModule.new({ from: owner });
            await this.allowanceModule.transferOwnership(this.token.address, { from: owner });
            this.registryModule = await RegistryModule.new({ from: owner });
            await this.registryModule.transferOwnership(this.token.address, { from: owner });

            await this.token.setBalanceModule(this.balanceModule.address, { from: owner });
            await this.token.setAllowanceModule(this.allowanceModule.address, { from: owner });
            await this.token.setRegistryModule(this.registryModule.address, { from: owner });

            // mint 100 first for rest[1]
            await this.token.mint(rest[1], new BN(100), { from: owner });
        });

        it('only owner can sweep', async function() {
            await shouldFail.reverting(this.token.sweep(rest[0], rest[1], rest[0], new BN(100), { from: rest[0] }));
            await this.token.sweep(rest[0], rest[1], rest[0], new BN(100), { from: owner });
        });

        it('must have sufficient balance to sweep', async function() {
            await shouldFail.reverting(this.token.sweep(rest[0], rest[1], rest[0], new BN(1000), { from: owner }));
            await this.token.sweep(rest[0], rest[1], rest[0], new BN(80), { from: owner });

            const bal1 = await this.token.balanceOf(rest[0]);
            const bal2 = await this.token.balanceOf(rest[1]);
            bal1.should.be.a.bignumber.equals(new BN(80));
            bal2.should.be.a.bignumber.equals(new BN(20));
        });
    });
});