const Utils = {
    tranformStr(str){
        const re=/-(\w)/g;
        return str.replace(re,function ($0,$1){
            return $1.toUpperCase();
        });
    },
    uniqArrObj(arr,key){//数组对象去重
        var result  = []
        var number = []
        for(var i = 0;i<arr.length;i++){
            if(number.indexOf(arr[i][key])==-1){
                number.push(arr[i][key])
                result.push(arr[i])
            }
        }
        return result
    }
}
module.exports = Utils;