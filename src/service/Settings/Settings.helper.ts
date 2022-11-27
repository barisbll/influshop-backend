export const anonymizeNames = (name: string) => {
    const names = name.split(' ');

    const anonymNames = names.map((eachName) => {
        if (eachName.length === 1) {
            return eachName;
        }
        if (eachName.length === 2) {
            return `${eachName[0]}*`;
        }
        if (eachName.length > 2) {
            return `${eachName[0]}${eachName[1]}***`;
        }
        return '';
    });

    return anonymNames.join(' ');
};
