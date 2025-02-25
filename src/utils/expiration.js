const time_units = {
    h: 3600 * 1000,
    d: 3600 * 1000 * 24,
    m: 60 * 1000,
    s: 1000,
    ms: 1,
};

export function getExpirationIn() {
    const expiredInStr = "1s";
    const amount = expiredInStr.split(/\D/)[0];
    const parseArray = expiredInStr.split(/\d/);
    const index = parseArray.findIndex((e) => !!e.trim());
    const unit = parseArray[index];
    const unitValue = time_units[unit];
    if (!unitValue) {
        throw new Error('Invalid time unit');
    }
    return amount * unitValue;
}