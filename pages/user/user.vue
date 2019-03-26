<template>
    <view class="content">
		
		<view class="center-list">
			<view class="center-list-item border-bottom">
				<uni-icon  type="contact" size="25" color="#41b49d"></uni-icon>
				<text class="list-text">帐号管理</text>
				<view class="arrow">
					<uni-icon class="arrow" type="forward" size="25" color="#555"></uni-icon>
				</view>
			</view>
			<view class="center-list-item" @tap="setAddress">
				<uni-icon  type="location" size="25" color="#41b49d"></uni-icon>
				<text class="list-text">常用地址</text>
				<view class="arrow">
					<uni-icon  type="forward" size="25" color="#555"></uni-icon>
				</view>
			</view>
		</view>
        <view class="btn-row">
            <button v-if="!hasLogin" type="primary" class="primary" @tap="bindLogin">登录</button>
            <button v-if="hasLogin" type="default" @tap="bindLogout">退出登录</button>
        </view>
		
		<prompt
		  title="常用地址"
		  placeholder=""
		  defaultValue=""
		  mainColor="#e74a39"
		  @confirm="clickPromptConfirm"
		  @cancel = "cancel"
		  v-if="promptVisible"
		>
		  <!-- 这里放入slot内容-->
		  <text>将会在添加时快速添加</text>
		</prompt>
    </view>
	
</template>

<script>
	import Prompt from '@/components/zz-prompt/index.vue'
	import uniIcon from "@/components/uni-icon/uni-icon.vue"
    import dataBase from '../../dataBase.js';
    import {
        mapState,
        mapMutations
    } from 'vuex'

    export default {
		components: {
			Prompt,
			uniIcon
		},
		data(){
			return{
				promptVisible: false,
			}
		},
        computed: {
            ...mapState(['hasLogin', 'forcedLogin', 'userName'])
        },
        methods: {
            ...mapMutations(['logout']),
			check_login(){
				    if (!this.hasLogin) {
				        uni.showModal({
				            title: '未登录',
				            content: '您未登录，需要登录后才能继续',
				            /**
				             * 如果需要强制登录，不显示取消按钮
				             */
				            showCancel: !this.forcedLogin,
				            success: (res) => {
				                if (res.confirm) {
									/**
									 * 如果需要强制登录，使用reLaunch方式
									 */
				                    if (this.forcedLogin) {
				                        uni.reLaunch({
				                            url: '../login/login'
				                        });
				                    } else {
				                        uni.navigateTo({
				                            url: '../login/login'
				                        });
				                    }
				                }
				            }
				        });
				    }
			},
            bindLogin() {
                uni.navigateTo({
                    url: '../login/login',
                });
            },
            bindLogout() {
                this.logout();
                /**
                 * 如果需要强制登录跳转回登录页面
                 */
                if (this.forcedLogin) {
                    uni.reLaunch({
                        url: '../login/login',
                    });
                }
            },
			setAddress() {
				this.check_login();
				if(!this.hasLogin) return;
				this.promptVisible = true;
			},
			clickPromptConfirm(val) {
				this.promptVisible = false;
				var data = {
					_from:"freAddress",
					val:val,
				};
				dataBase.storeMessage(this.userName,data);
			},
			cancel(){
				this.promptVisible = false;
				return;
			}
        }
    }
</script>

<style>

	.center-list {
		background-color: #FFFFFF;
		margin-top: 20upx;
		width: 700upx;
		flex-direction: column;
	}

	.center-list-item {
		height: 90upx;
		width: 700upx;
		box-sizing: border-box;
		flex-direction: row;
		padding: 0upx 20upx;
		text-align: left;
	}

	.border-bottom {
		border-bottom-width: 1upx;
		border-color: #c8c7cc;
		border-bottom-style: solid;
	}


	.list-text {
		height: 90upx;
		line-height: 90upx;
		font-size: 34upx;
		color: #555;
		flex: 1;
		text-align: left;
	}

	.arrow {
		float: right;
		text-align: center;
		margin-top: 20upx;
	}
</style>
