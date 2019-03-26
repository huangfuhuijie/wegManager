const getDataBase = function(userName){
	let ret = '';
	ret = uni.getStorageSync(userName+"dataBase");
	if (!ret) {
	    ret = '[]';
	}
	return JSON.parse(ret);
}

const changeData = function(userName,data){
	let dataBase = getDataBase(userName);
	for(let i=0;i<dataBase.length;i++){
		if(dataBase[i].id==data.id){
			dataBase[i] = data;
			break;
		}else{
			continue;
		}
	}
	uni.setStorageSync(userName+"dataBase", JSON.stringify(dataBase));
}

const storeData = function(userName,data){
	let dataBase = getDataBase(userName);
	if(dataBase.length==0){
		data.id = 1;
	}else{
		data.id = dataBase[dataBase.length-1].id+1;
	}
	dataBase.push(data);
	uni.setStorageSync(userName+"dataBase", JSON.stringify(dataBase));
}

const deleteData = function(userName,data){
	let dataBase = getDataBase(userName);
	for(let i=0;i<dataBase.length;i++){
		if(dataBase[i].id==data.id){
			dataBase.splice(i,1);
			break;
		}else{
			continue;
		}
	}
	uni.setStorageSync(userName+"dataBase", JSON.stringify(dataBase));
}

const getMessage = function(userName){
	let ret = '';
	ret = uni.getStorageSync(userName+"Message");
	if (!ret) {
	    ret = '{}';
		console.log("结果为空")
	}
	return JSON.parse(ret);
}

const storeMessage = function(userName,data){
	let messageBox = getMessage(userName);
	messageBox[data._from] = data.val;
	console.log(messageBox.freAddress);
	uni.setStorageSync(userName+"Message", JSON.stringify(messageBox));
	
}
export default{
	getDataBase,
	storeData,
	changeData,
	deleteData,
	getMessage,
	storeMessage,
}