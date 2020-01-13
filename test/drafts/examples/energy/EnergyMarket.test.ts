import { BigNumber } from 'bignumber.js';
// tslint:disable-next-line:no-var-requires
import { EnergyMarketInstance } from '../../../../types/truffle-contracts';

const EnergyMarket = artifacts.require(
    './drafts/examples/energy/EnergyMarket.sol',
    ) as Truffle.Contract<EnergyMarketInstance>;

// tslint:disable:no-var-requires
const chai = require('chai');
const girino = require('girino');
// tslint:enable:no-var-requires

const { expect } = chai;

chai.use(girino);

contract('EnergyMarket', (accounts) => {
    const owner = accounts[0];
    const authorized = accounts[1];
    const unauthorized = accounts[2];

    let energyMarket: EnergyMarketInstance;

    const initialSupply = 1000000;
    const basePrice = 10;

    const timeSlot = 1;

    beforeEach(async () => {
        energyMarket = await EnergyMarket.new(
            initialSupply,
            basePrice,
        );
        await energyMarket.addMember(authorized);
    });

    /**
     * @test {EnergyMarket#produce}
     */
    it('Produce energy', async () => {
        expect(energyMarket.produce(timeSlot, { from: authorized })).to.emit('EnergyProduced').withArgs(authorized);
    });

    /**
     * @test {EnergyMarket#produce}
     */
    it('Produce throws with unauthorized producer', async () => {
        expect(energyMarket.produce(timeSlot, { from: unauthorized })).to.revertWith('Unknown meter.');
    });

    /**
     * @test {EnergyMarket#consume}
     */
    it('Consume energy', async () => {
        await energyMarket.produce(timeSlot, {from: authorized });
        await energyMarket.approve(
            energyMarket.address, await energyMarket.getConsumptionPrice(1), { from: authorized },
        );
        expect(energyMarket.consume(timeSlot, { from: authorized })).to.emit('EnergyConsumed').withArgs(authorized);
    });

    /**
     * @test {EnergyMarket#consume}
     */
    it('Consume throws with unauthorized consumer', async () => {
        expect(energyMarket.consume(timeSlot, { from: unauthorized })).to.revertWith('Unknown meter.');
    });

    /**
     * @test {EnergyMarket#consume}
     */
    it('Consume throws if consumer has insufficient balance', async () => {
        expect(energyMarket.consume(timeSlot, { from: authorized })).to.revert;
    });
});
