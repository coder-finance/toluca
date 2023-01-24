const voteStringFromInt = (voteInt) => {
    let voteValueString = "undefined";
    switch (voteInt) {
        case 1:
            voteValueString = "For";
            break;
        case 0:
            voteValueString = "Against";
            break;
        case 2:
            voteValueString = "Abstain";
            break;
        default:
            console.error("Invalid voteInt", voteInt)
    }
    return voteValueString
}
exports.voteStringFromInt = voteStringFromInt;

const voteIntFromLabel = (voteLabel) => {
    let voteValueInt = -1;
    switch (voteLabel) {
        case "for":
            voteValueInt = 1;
            break;
        case "against":
            voteValueInt = 0;
            break;
        case "abstain":
            voteValueInt = 2;
            break;
        default:
            console.error("Invalid voteValue", voteLabel)
    }
    return voteValueInt
}
exports.voteIntFromLabel = voteIntFromLabel;

const voteColorFromInt = (voteInt) => {
    let voteValueString = "gray";
    switch (voteInt) {
        case 1:
            voteValueString = "green";
            break;
        case 0:
            voteValueString = "red";
            break;
        case 2:
            voteValueString = "gray";
            break;
        default:
            console.error("Invalid voteInt", voteInt)
    }
    return voteValueString
}
exports.voteColorFromInt = voteColorFromInt;