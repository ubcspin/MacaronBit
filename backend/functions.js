function mapValue(value, minIn, maxIn, minOut, maxOut){
    if (value>maxIn){
        value = maxIn;
    }
    if (value<minIn){
        value = minIn;
    }
    return (value / (maxIn - minIn) )*(maxOut - minOut);
}

module.exports = {
    mapValue: mapValue,
    // log:log,
}