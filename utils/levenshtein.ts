function levenshtein(string1: string, string2: string): number{

    if(typeof string1 !== "string" || typeof string2 !== "string"){
        throw new TypeError("Title must be of type string");
    }

    if(string1.length === 0){
        return string2.length;
    }
    if(string2.length === 0){
        return string1.length;
    }

    const truncatedString1 = string1.slice(1);
    const truncatedString2 = string2.slice(1);

    const del = levenshtein(truncatedString1, string2);
    const ins = levenshtein(string1, truncatedString2);
    const rep = levenshtein(truncatedString1, truncatedString2);

    if(string1[0] === string2[0]){
        return rep;
    }

    if(del <= ins && del <= rep) return 1 + del;

    if(ins <= del && ins <= rep) return 1 + ins;

    if(rep <= ins && rep <= del) return 1 + rep;
    
}