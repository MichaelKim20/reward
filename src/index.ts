const GENESIS_TIME = 1664326800;        //  Agora-CL이 시작된 시간

function getTimeStamp(): number {
    return Math.floor(new Date().getTime() / 1000);
}

enum RewardPeriod {
    DAY = 0,
    WEEK = 1,
    MONTH = 2,
    YEAR = 3,
    EPOCH = 4,
}

/**
 *
 * @param numNewValidator 추가될 검증자의 수
 * @param totalValidatorBalance 모든 검증자들의 잔고의 합 (단위는 BOA)
 *  https://testnet.agorascan.io/api/v1/epoch/latest 에서 받은 데이타중 totalvalidatorbalance 를 사용합니다.
 *  totalvalidatorbalance 에 1e-9를 곱해줍니다.
 * @param period
 */
function getReward(numNewValidator: number, totalValidatorBalance: number, period: RewardPeriod): number
{
    const SLOTS_PER_EPOCH = 32;             //  에포크당 슬롯의 갯수
    const SECONDS_PER_SLOT = 12;            //  하나의 슬롯이 생성되는 초
    const SECONDS_PER_EPOCH = SLOTS_PER_EPOCH * SECONDS_PER_SLOT;   //  에포크가 생성되는 초
    const DaysOfSec = 24 * 60 * 60;
    const WeeksOfSec = 7 * 24 * 60 * 60;
    const MonthsOfSec = 30 * 24 * 60 * 60;
    const YearsOfSec = 365 * 24 * 60 * 60;
    const MinValidator = 1024;
    const DepositAmount = 40_000;
    const MinValidatorAmount = MinValidator * DepositAmount;

    // Agora-CL이 시작된 후 몇초가 지났는지 계산
    let secondsSinceGenesis = getTimeStamp() - GENESIS_TIME;
    if (secondsSinceGenesis < 0) secondsSinceGenesis = 0;

    // Agora-CL이 시작된 후 몇년이 지났는지 계산
    const currentYear = Math.floor(secondsSinceGenesis / YearsOfSec);

    // 현재년도의 년간 리워드를 계산한다.
    const firstYearValRewards = 7 * (YearsOfSec / 5);
    let currentYearReward = firstYearValRewards;

    for (let i = currentYear; i > 0; i--) {
        currentYearReward = currentYearReward * 98653 / 100000;
    }

    // 초당 리워드를 계산한다.
    const rewardPerSecond = currentYearReward / YearsOfSec;
    // 하나의 에포크당 리워드를 계산한다.
    const rewardPerEpoch = rewardPerSecond * SECONDS_PER_EPOCH;

    // 사용자가 스테이킹할 금액을 계산한다.
    const userStake = numNewValidator * 40_000;

    //  전체 스테이킹 금액을 계산한다.
    let totalStake = totalValidatorBalance + userStake;
    if (totalStake < MinValidatorAmount)
        totalStake = MinValidatorAmount;

    // 사용자의 하나의 에포크당 리워드를 계산한다.
    const baseReward = (userStake * rewardPerEpoch) / totalStake;

    // 총 몇 에포크인지 계산한다.
    let numEpoch = 0;
    if (period === RewardPeriod.DAY) {
        numEpoch = Math.floor(DaysOfSec / SECONDS_PER_EPOCH);
    } else if (period === RewardPeriod.WEEK) {
        numEpoch = Math.floor(WeeksOfSec / SECONDS_PER_EPOCH);
    } else if (period === RewardPeriod.MONTH) {
        numEpoch = Math.floor(MonthsOfSec / SECONDS_PER_EPOCH);
    } else if (period === RewardPeriod.YEAR) {
        numEpoch = Math.floor(YearsOfSec / SECONDS_PER_EPOCH);
    }else if (period === RewardPeriod.EPOCH) {
        numEpoch = 1;
    }

    // 입력된 기간에 대한 리워드를 계산한다.
    return Math.floor(baseReward * numEpoch * 100) / 100;
}


/**
 * GENESIS_TIME 대신에 현재 EPOCH를 입력할 때
 * @param numNewValidator 추가될 검증자의 수
 * @param totalValidatorBalance 모든 검증자들의 잔고의 합 (단위는 BOA)
 *  https://testnet.agorascan.io/api/v1/epoch/latest 에서 받은 데이타중 totalvalidatorbalance 를 사용합니다.
 *  totalvalidatorbalance 에 1e-9를 곱해줍니다.
 * @param period
 */
function getReward2(epoch: number, numNewValidator: number, totalValidatorBalance: number, period: RewardPeriod): number
{
    const SLOTS_PER_EPOCH = 32;             //  에포크당 슬롯의 갯수
    const SECONDS_PER_SLOT = 12;            //  하나의 슬롯이 생성되는 초
    const SECONDS_PER_EPOCH = SLOTS_PER_EPOCH * SECONDS_PER_SLOT;   //  에포크가 생성되는 초
    const DaysOfSec = 24 * 60 * 60;
    const WeeksOfSec = 7 * 24 * 60 * 60;
    const MonthsOfSec = 30 * 24 * 60 * 60;
    const YearsOfSec = 365 * 24 * 60 * 60;
    const MinValidator = 1024;
    const DepositAmount = 40_000;
    const MinValidatorAmount = MinValidator * DepositAmount;

    // Agora-CL이 시작된 후 몇초가 지났는지 계산
    let secondsSinceGenesis = epoch * SECONDS_PER_EPOCH;
    if (secondsSinceGenesis < 0) secondsSinceGenesis = 0;

    // Agora-CL이 시작된 후 몇년이 지났는지 계산
    const currentYear = Math.floor(secondsSinceGenesis / YearsOfSec);

    // 현재년도의 년간 리워드를 계산한다.
    const firstYearValRewards = 7 * (YearsOfSec / 5);
    let currentYearReward = firstYearValRewards;

    for (let i = currentYear; i > 0; i--) {
        currentYearReward = currentYearReward * 98653 / 100000;
    }

    // 초당 리워드를 계산한다.
    const rewardPerSecond = currentYearReward / YearsOfSec;
    // 하나의 에포크당 리워드를 계산한다.
    const rewardPerEpoch = rewardPerSecond * SECONDS_PER_EPOCH;

    // 사용자가 스테이킹할 금액을 계산한다.
    const userStake = numNewValidator * 40_000;

    //  전체 스테이킹 금액을 계산한다.
    let totalStake = totalValidatorBalance + userStake;
    if (totalStake < MinValidatorAmount)
        totalStake = MinValidatorAmount;

    // 사용자의 하나의 에포크당 리워드를 계산한다.
    const baseReward = (userStake * rewardPerEpoch) / totalStake;

    // 총 몇 에포크인지 계산한다.
    let numEpoch = 0;
    if (period === RewardPeriod.DAY) {
        numEpoch = Math.floor(DaysOfSec / SECONDS_PER_EPOCH);
    } else if (period === RewardPeriod.WEEK) {
        numEpoch = Math.floor(WeeksOfSec / SECONDS_PER_EPOCH);
    } else if (period === RewardPeriod.MONTH) {
        numEpoch = Math.floor(MonthsOfSec / SECONDS_PER_EPOCH);
    } else if (period === RewardPeriod.YEAR) {
        numEpoch = Math.floor(YearsOfSec / SECONDS_PER_EPOCH);
    }else if (period === RewardPeriod.EPOCH) {
        numEpoch = 1;
    }

    // 입력된 기간에 대한 리워드를 계산한다.
    return Math.floor(baseReward * numEpoch * 100) / 100;
}

async function main() {
    console.log(getReward(1, 40_000 * 1000, RewardPeriod.DAY));
    console.log(getReward(2, 40_000 * 1000, RewardPeriod.DAY));
    console.log(getReward(1, 40_000 * 1000, RewardPeriod.WEEK));
    console.log(getReward(1, 40_000 * 1000, RewardPeriod.MONTH));
    console.log(getReward(1, 40_000 * 1000, RewardPeriod.YEAR));
    console.log(getReward2(82125, 1, 40_000 * 1000, RewardPeriod.DAY));
    console.log(getReward2(82125, 1, 40_000 * 1000, RewardPeriod.DAY));
    console.log(getReward2(82125 * 2, 1, 40_000 * 1000, RewardPeriod.DAY));
    console.log(getReward2(82125 * 3, 1, 40_000 * 1000, RewardPeriod.DAY));
    console.log(getReward2(82125 * 4, 1, 40_000 * 1000, RewardPeriod.DAY));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
