const getDataBase = function(res){
	let ret = '';
	ret = uni.getStorageSync(res+"dataBase");
	if (!ret) {
	    ret = '[]';
	}
	return JSON.parse(ret);
}
const storeData = function(res,data){
	let dataBase = getDataBase(res);
	if(dataBase.length==0){
		data.id = 1;
	}else{
		data.id = dataBase[dataBase.length-1].id+1;
	}
	dataBase.push(data);
	uni.setStorageSync(res+"dataBase", JSON.stringify(dataBase));
}

const changeData = function(res,data){
	let dataBase = getDataBase(res);
	for(let i=0;i<dataBase.length;i++){
		if(dataBase[i].id==data.id){
			dataBase[i] = data;
			break;
		}else{
			continue;
		}
	}
	uni.setStorageSync(res+"dataBase", JSON.stringify(dataBase));
}

const deleteData = function(res,data){
	let dataBase = getDataBase(res);
	for(let i=0;i<dataBase.length;i++){
		if(dataBase[i].id==data.id){
			dataBase.splice(i,1);
			break;
		}else{
			continue;
		}
	}
	uni.setStorageSync(res+"dataBase", JSON.stringify(dataBase));
}
export default{
	getDataBase,
	storeData,
}