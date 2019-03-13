<template>
	<view class="content">
		<view class="input-group">
			<view class="input-row border">
				<text class="title">日期：</text>
				<view class="uni-list-cell-db picker">
                    <picker mode="date" :value="date" :start="startDate" :end="endDate" @change="bindDateChange">
                    <view class="uni-input">{{date}}</view>
                    </picker>
                </view>
			</view>
			<view class="input-row border">
				<text class="title">数值： </text>
				<m-input type="text" focus clearable v-model="value" placeholder="请输入数值"></m-input>
			</view>
			<view class="input-row">
				<text class="title">地址： </text>
				<m-input type="text" clearable v-model="address" placeholder="请输入地址"></m-input>
			</view>
		</view>
		<view class="btn-row">
			<button type="primary" class="primary" @tap="okey">添加</button>
		</view>
	</view>
</template>

<script>
    import {
        mapState
    } from 'vuex'
	import mInput from '../../components/m-input.vue';
	import dataBase from '../../dataBase.js';
	var from_ ;//页面来源
	
	export default {
        computed: mapState(['forcedLogin', 'hasLogin', 'userName']),
		components: {
		    mInput
		},
		onLoad(e){
			console.log(e.msg);
			from_ = e.msg;
		},
		data() {
			
			const currentDate = this.getDate({
            format: true
			})

			return {
				date:currentDate,
				value:"",
				address:"",
			};
		},
		methods:{
			 bindDateChange: function(e) {
            this.date = e.target.value
			},

			getDate(type) {
            const date = new Date();
            let year = date.getFullYear();
            let month = date.getMonth() + 1;
            let day = date.getDate();

            if (type === 'start') {
                year = year - 60;
            } else if (type === 'end') {
                year = year + 2;
            }
            month = month > 9 ? month : '0' + month;;
            day = day > 9 ? day : '0' + day;
            return `${year}-${month}-${day}`;
			},
			okey(){
				if(this.hasLogin)
				{
					if(this.value.length<0) {
						uni.showToast({
							icon: 'none',
							title: '请输入数值'
						});
						return;
					}
					var data = {
						date:this.date,
						data:this.value,
						address:this.address,
					}
					dataBase.storeData(this.userName,data);
					uni.showToast({
						title: '添加成功'
					});
					uni.navigateBack({
					});
				}else{
					uni.showModal({
						title: '未登录',
						content: '您未登录，需要登录后才能继续',
					})
				}
			}
		}
	}
</script>

<style>
	.picker{
		width: 100%;
		height: 100%;
		align-items: center;
	}
</style>
