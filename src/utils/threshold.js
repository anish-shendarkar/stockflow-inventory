export const getThresholdByProductType = (type) => {
    const thresholds = {
        FAST_MOVING: 50,
        NORMAL: 20,
        SLOW_MOVING: 10
    };

    return thresholds[type] || 15;
};
