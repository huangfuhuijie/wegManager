<template>
    <view class="content">
		<uni-fab
		:pattern="pattern"
		:content="content"
		:horizontal="horizontal"
		:vertical="vertical"
		:direction="direction"
		:type="type"
		@trigger="trigger"
		></uni-fab>
		
		<view class="top-box">
			<view class="title">使 用 统 计</view>
			<view style=" display: -webkit-box;">
				<view class="left-box">
					<view>据上次用水量</view>
					<view>{{last_value}}</view>
					<view @tap="setprice" style="font-weight: bold;">设置  水费</view>
					<view>{{preprice}}</view>
					<view>预计水费</view>
					<view>{{price}}</view>
				</view>
				<scroll-view scroll-x="true" scroll-y="true" scroll-left="120" class="right-box">
					<canvas style="width:1000upx;height:400upx;" canvas-id="canvas"></canvas>
				</scroll-view>
			</view>
		</view>
		<view class="container">
			<scroll-view scroll-y="true" scroll-top="120" class="end-box">
				<view class="address-list">
					<view class="a-address" v-for="(item,index) in addressList" :key="index">
						<view class="left-text" @tap="selectTap(item.id)">
							<view class="name-tel">
								{{item.date}}        {{item.data}}
							</view>
							<view class="address-box">
								{{item.address}}
							</view>
						</view>
						<view class="right-edit" @tap="editAddess(item.id)"></view>
					</view>
				</view>
			</scroll-view>
		</view>
		
		<prompt
		  title="水费"
		  placeholder=""
		  defaultValue=""
		  mainColor="#e74a39"
		  @confirm="clickPromptConfirm"
		  @cancel = "cancel"
		  v-if="promptVisible"
		>
		  <!-- 这里放入slot内容-->
		</prompt>
    </view>
</template>

<script>
    import {
        mapState
    } from 'vuex'
	import uniFab from '@/components/uni-fab/uni-fab.vue';
	import Prompt from '@/components/zz-prompt/index.vue'
    import dataBase from '../../dataBase.js';
	
    export default {
        computed: mapState(['forcedLogin', 'hasLogin', 'userName']),
		components: {
			uniFab,
			Prompt,
		},
        onLoad() {
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
		onShow() {
			if(this.hasLogin){
				this.addressList = dataBase.getDataBase(this.userName).reverse();
				if(this.addressList.length>1)
				{
						let before = Number(this.addressList[1].data);
						let later = Number(this.addressList[0].data);
						this.last_value = later-before;
				}
				let pprice = dataBase.getMessage(this.userName);
				if(pprice.waterprice!=undefined) 
				{
					this.preprice = pprice.waterprice;
				}
				this.calprice();
				
				var ctx	 = uni.createCanvasContext('canvas');
				this.drawBorder(ctx);
				this.drawLine(ctx);
				ctx.draw();
			}
		},
		 data() {
			return {
				horizontal: 'left',
				vertical: 'bottom',
				direction: 'horizontal',
				pattern: {
					color: '#7A7E83',
					backgroundColor: '#fff',
					selectedColor: '#007AFF',
					buttonColor:"#007AFF"
				},
				type:"water",
				addressList: [{
					id:1,
					date:"未登录",
					data:'请在登陆后使用',
					address:'未登录',
				}],
				last_value:'等待更多数据',
				preprice:'null',
				price:'null',
				promptVisible: false,
				};
		},
		methods: {
			trigger(e) {
				
			},
			calprice(){
				try{
						let a = Number(this.last_value);
						let b = Number(this.preprice);
						let c = a*b;
						this.price = c.toFixed(2);
					}catch(e){
						//TODO handle the exception
						console.log("计算水费时不为数值");
					}
			},
			selectTap(id) {
				console.log("tap item id:" + JSON.stringify(id));
			},
			editAddess(id) {
				console.log("edit item id:" + id);
				uni.navigateTo({
					url:"../add-page/add-page?msg=water&type=change&id="+id,
				})
			},
			setprice(){
				if(!this.hasLogin) return ;
				this.promptVisible = true;
			},
			clickPromptConfirm(val) {
				this.promptVisible = false;
				var data = {
					_from:"waterprice",
					val:val,
				};
				dataBase.storeMessage(this.userName,data);
				this.preprice = val;
				this.calprice();
				
			},
			cancel(){
				this.promptVisible = false;
				return;
			},
			drawBorder(ctx){
				ctx.beginPath();
				ctx.setLineWidth(2)
				ctx.moveTo(0,20);
				ctx.lineTo(0,180);
				ctx.moveTo(0,180);
				ctx.lineTo(600,180);
				ctx.closePath();
				ctx.stroke();
			},
			getData(){
				let ddata = new Array();
				let address = new Array();
				var t = {
					ddata: Array,
					address:Array,
				};
				let i;
				for(i=0;i<10&&i<this.addressList.length-1;i++){
					ddata.push(Number(this.addressList[i].data)-Number(this.addressList[i+1].data));
					address.push(this.addressList[i].date.substr(5,5));
				}
				address.push(this.addressList[i].date.substr(5,5));
				t.ddata = ddata;
				t.address = address;
				return t;
			},
			drawLine(ctx){
				let t = this.getData();
				var nums = t.ddata.reverse();
				var adds = t.address.reverse();
				var max = 0;
				for(let i=0;i<nums.length;i++){
					max = max<nums[i]? nums[i]:max;
				}
				ctx.fillText(max,0,20);
				ctx.fillText(max/2,0,105);
				ctx.fillText(0,0,190);
				let i;
				for (i = 0;i < nums.length-1;i ++){
					//起始坐标
					var numsY = 180-nums[i]/max*160;
					var numsX = i*40+15;
					
					//终止坐标
					var numsNY = 180-nums[i+1]/max*160;
					var numsNX = (i+1)*40+15;
					ctx.setFontSize(5);
					ctx.fillText(adds[i],i*40+15,185);
					ctx.fillText("-"+adds[i+1],i*40+15,190);
					ctx.beginPath();
					ctx.moveTo(numsX,numsY);
					ctx.lineTo(numsNX,numsNY);
					ctx.lineWidth = 3;
					ctx.strokeStyle = "#80aa33";
					ctx.closePath();
					ctx.stroke();
				}
				ctx.fillText(adds[i],i*40+15,185);
				ctx.fillText("-"+adds[i+1],i*40+15,190);
			},
    },

    }
</script>

<style>
	.top-box{
		float: top;
		height: 600upx;
		background: #75daff;
	}
	.end-box{
		height: 430upx;
	}
    .title {
        color: #8f8f94;
        margin-top: 40upx;
		margin-left: 30upx;
		width: 645upx;
		height:70upx;
		background: #7aa5fb;
		text-align: center;
		line-height: 70upx;
		color: #FFF;
    }
	.left-box{
        color: #8f8f94;
        margin-top: 40upx;
		margin-left: 30upx;
		width: 310upx;
		height:400upx;
		background:#7abafb ;
		line-height: 65upx;
		text-align: center;
	}
	.right-box{
        color: #8f8f94;
        margin-top: 40upx;
		margin-left: 30upx;
		width: 310upx;
		height:400upx;
	}
    .ul {
        font-size: 30upx;
        color: #8f8f94;
        margin-top: 50upx;
    }

    .ul>view {
        line-height: 50upx;
    }
	.container {
		background-color: #F2f2f2;
	}
	
	.address-list {
		width: 100%;
		background-color: #fff;
		margin-top: 20upx;
		padding-bottom: 100upx;
	}
	
	.address-list .a-address {
		margin-left: 30upx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30upx 0;
		border-bottom: 1upx solid #eee;
	}
	
	.a-address .left-text {
		width: 510upx;
		box-sizing: border-box;
		padding-left: 20upx;
	}
	
	
	.a-address .left-text .name-tel {
		margin-bottom: 20upx;
	}
	
	.a-address .left-text .address-box {
		font-size: 24upx;
		color: #888888;
		line-height: 36upx;
	}
	
	.a-address .right-edit {
		width: 90upx;
		height: 100%;
		padding: 50upx 0 50upx 58upx;
		box-sizing: border-box;
		background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAAAXNSR0IArs4c6QAABPhJREFUeAHtnE1oE0EUx80HQW39SCvYgBVBqhUU+l1FD1ZFPIgnQdDiRfGmh168eBDR4k1B8OLHSVTQg6gnUQ+CaNLWQGu8lSqtrZQKgk1jkzb1/zSzvKyTIO0mM7uZgc28eftm571fZnaTzGR8y4qkRCJRPTMzswsmG3HULiwsBIqYO3bK5/PNoa1oR0fHG8cuWuBCIyMjyycnJy+hzW6YIPPdr6uru1BfX5+iKj57PTjm6+vrOwz9WchdyIN2mzKWL3R2dl4pVXujo6MrJiYmniHO/bwNQLqFN+cM6fIA9ff3b85ms7dRYS+voFCehqNr4HDWaR8KwaF20F4mHA6vamhomLV6RzQabZufn3+B82GnnVnC9RaWULdg1WJwcpWCYBGC/BcQ4GxB4RWO1TkDLTK8k71O957/gEOxv25sbPxJQhDDyR+Lxe5ALgRnEE4OwG7Y7/enqVIZ0hzaiLW3t791si2CMz4+/hzX3FfkumPBYPCUOB/EDfkgCnuEQuSAMoSjB06+FDo356LnIIaicAKBwN6WlpYvIlbqQSdFQeQAk4C+CzfI70Ln5lzAQUx5TytbTGMEp62tbZjrg4DRiopctwxD6RQMKx4OQfEDDn0ItBKAzba2tsYshYuFpfQcEbYfwnJRyOUpQMrvUjYDNxSdgENxEiDPJafgEBjPAXISjucAOQ3HU4BKAcczgEoFxxOASgnH9YBKDcfVgMoBx7WAygWHAFk/mFHBDYng/M9PFrIvnouJz1UfFMsNh4C6BpAKOK4BpAqOKwCphKM9INVwtAakAxxtAekCR0tAOsHRDpBucLQCpCMcbQDpCocAKf8upgOcoaGh9VgHdRrzgTSRehcTpqMEh5LSrxq0eKmcXzz/hpz/Go/H1wJOP7SXsfTnIvI41irUCSulgKampsihfcIZSS6dDpbYLVqVyWRosdgGcQH0oFrMCx4VZaWA4Mxx4YgkLzmcXJu19rbRk9YJnVJAcKLQDG654AgOBXOlgNCD7kk80wYO+aYUUE1NzSU8OW7Aj18Y97QO8QV+CdxtX4JCjqpKSh/ztEgSgZ9DT+oZGBgIAcyMKhCF2lUKSDiF3kNL7ujQLikdYtrRkDhkAEmgcJUBxGlIZANIAoWrDCBOQyIbQBIoXGUAcRoS2QCSQOEqA4jTkMgGkAQKVxlAnIZENoAkULjKAOI0JLIBJIHCVQYQpyGRDSAJFK4ygDgNiWwASaBwlQHEaUhkA0gChav8uekWS4cZhoqChngDVvA5gTMhGN9sBqsHBwd12p7C5p6zRcDI+1Nz7uo/RCv0r+e8/4nTiVQq1S0MKiDfbo8RTCaEjobYU1FgeW9uPw+m8p6IXSe2IiraAigvgcl7ofCHQqEHUNAMJ0/VKDzBdjmNXOklGZtHhdBTruOw33M/5S2gampq+orAr0mC34YtYj6gJ53nC4okdq5T0eiYnp6mjZUO2Z3HWoGbXPdngyXaiiuZTL5DhX/GozBGL0tCzoiyi3PqOStl/iPG4UgkskNsz0U21g5UWIq2KZ1O09hbL6vsdR3g0Jt/AMPrDY/VGn/Nzc2fcT/aCcOP3KBC5Hn0qhN2OBS7BYgKBKmqqmoXIF1F8c8ucKT3cqJhhWM/NpN7JIvTGmL2k3iCRUD1GNbrHcG5BhwRHP986rTX070MGBnENQ4/E7ghP8SWgI/5Pcfu/2//c4lF4CDN7wAAAABJRU5ErkJggg==) no-repeat 43upx center;
		background-size: 35upx auto;
	}
	
	.bottom-box {
		position: fixed;
		width: 100%;
		bottom: 0;
		font-size: 28upx;
		color: #000000;
		border-top: 1upx solid #eee;
		height: 100upx;
		line-height: 100upx;
		background: #fff url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAYCAYAAADzoH0MAAAAAXNSR0IArs4c6QAAAj1JREFUOBGVVE1LHEEQ7e4EkRBjiBL9AQqCQmB32d3xEMgxp6CCssEFFUMiBA+e9pKTgeBBBRGChEBCPAghISgiiEhu87Gzq/4Df4Yf292+Wulx2llXbRiq+1W9N9VVNcMYltaau2741fOqU3S+zxIUDOIKzAdIfXPdygRhd10ChCUQPxIBmQjO2XcIFu8sANox51wbAokA++H74VuDNbOcnAieRhnWLslRuORcjOfzqY0IabCpCxBOb1SK/cT2YSxOCsEKuVzmdwyztpEAob5fGdKabSCTllhUjTE+5jjpvzEs2loChLpu9TVjioJbTRQKe45nFJn8M5ixCQFyeF74CjXZRDEfR4EQEYKPZLPpLYORbShADt+vOlqrHVypnc600K0zNGwYmWxfIk0EKCAMw1StxnYh0mEIoJziGXKc1A5hN2ZgCEFw2C+l3Md1nhsM9gQ1eZPPZ3broxxzJLZayy6Qn1xzoNWijbCmAkFQfYmWUtGijmBPA1bEgP0hgfjQ0DlaQXAwKKWiYj0yIIqocOvJ+HQ2zKBcPswqJVGkeBvpe+HvQP5lBMkmiuh5lTTwPaT+1ATSx4aizeRy6TWDGWtlgN6/ABFtuyJTIMizjcjkiwTK5aMBDM4esGfkMAvTNwfyqjlft3UBDEyflOdIm3XaAaIE8rKN2acHnnfQq5T+D3K37RKfMG1fbCx5ErhvD2DrzbjzPMifk+FJpN4FFK8AoXU8Aj+QBXwspWToLQh+Ju/xV1q8JSzhvgCBx9kzUoIj2gAAAABJRU5ErkJggg==) no-repeat 705upx center;
		background-size: 15upx auto;
	}
	
	.bottom-box .add-btn {
		margin-left: 30upx;
		padding-left: 70upx;
		background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAAAXNSR0IArs4c6QAACNhJREFUeAHtnXtsFNUex89vZrfdLrRQK33gA0kMYCJEE40CUtvuUmgQoiZG4wOMGoMv1JuY6+Mf/rleFeODe9Ubk5soF29iNEpQWCy7rVYFoyYaapQaI+Kj2xYr8mq37O6c+z1znXXfOzs7u7Pb2Uma2Tlzzu/8fp/5ncf8ZuaUmIXbEY9nQZiUxYzxRRJnizix8zmnRiJWzzivZ0Ru7CcZsROcsZOM0XHi/BBn9C3yDJHEhlpk15fk801ZZQaVsuKR7u5mHj3dAzAezlkXwJ1lQv2TRLQPUN+XOQWa/f5PcAzepdmKDpBfd11N8Oiva+E5G2BSDyxzFNM0YnQYdbzGSN4+1+//pph1CdlFA3j06qtnh04d2wRP24Rm2FRsQ9LJRzPfD298oqW3751ieaXpAH9fs6YxNHXqL2hS93HOZ6UzrNRpADlIJP29ZXn767R5s2Jm/aYCDHo716NfexpeN8dMJc2SBZCfcXLePXfv3s9Nk2mGoCOrOxdGIvxfANdhhrxiykBThgfyl+tqZzw6e9euo4XWVbAHCq9Dp/0S+jl3ocqUtDzRjzKXbmgJBPYXUq9hgPzWW13Bnw7/E1fz9kIUsLIsjI8wiR5r7e3bYnSQMQQw2NMzh4Und6PJXmIlALPqBry3Ws+edxO98kooX5l5A/zN6z03xKO98LyF+VZWzvkxfxyoJXndGX7/sXz0zAugGCzCYe5HBWfnU0ml5AXEA3Jt3arm3btH9OqsG+CvV3WddTqk7GecnaNXeCXmExDhie16PVHSYySa7axwSPFNd3iCBWd8yRSP7hSDpB42OQHyzZsdUyyyAwMGoib22ACxfeTnw6/hTipnC80JcOTDD/5WCRNksy8t4F070t31UC65WQmPejtXKZz7MFHOmi9XJZV6HkZHJCa3Z5tsZwQzus7TokwoB3AlmisVgCl6447FXeu+KNNtX8YmzE9FERSwOTxxBTg/d3Lq1OOZLkZaDxxb5VkRiUQHMhWyW7oIQHByXJYuipPigYggy9GIgntcazf3mrWs+fU31T/3VWstVQYtUSIefhEzkhReKQkjR8cRXeFLrNTYMX8+a3jgQSY3Nal/Dfc/yESalRtmIpeOfjxwfbIOCQAFYdD+a3KmUh87Fy7Cc6c/exfxW6RZvXGuPAI+fyoGhRIABj/64JpyCBKQLKewSpeWkqnICeJmYrS7K6E/SQBIzHrvKzKDgsXDAx+OFxIDiGe2F4p2Hn+y+juVABgtHfZ6L9DOxAByJXKzlljd5yDAozFWKkDRMXKm3JijWPX0HwQwitykDSYqwLHurmV2CFWZ5QGY5s0b83ovF/JUgIoi3lOpbvkQiBL3iPwqQExdOvMpXM0rwlO8Q3CQeE9PLcJVS6tQ8iOAPnCZYCeNhsMXo6iu8HV+VUz73HWj0dBFuHWLTKvHk6W8bDyqvhhKC0pZ6XSqC2+gLZDQGVYBGryqgp3EieYbLG/7YoIdXrflDWaTELE7NSSVJqqipy7n4tRwpEgz+voXj0ZZeOggixw6pKf6PPLwBgp6O4Zxg9yWR6msWUX0WARA4+N5WQuU6CSmHez4c8+yiV3vmFYjwpRBCbdw9aZJhKCZt2woO3jCPnFBZ67fYKapaLysXoLkOnOl2kga2MED+YSZJp/c9ipE4t6mzDah08n/vGquVmDngAeegMWmNWPRx5z++quCBxG3d2WCsRP+vSw8eCAhTe9B0QYRsHPgwpzQq4jefGK0K2TEU0fbJIAC3sSud/WqUJJ8gp2Er6IKflO9JNqWYSWCHR4Ys+/KULeKUEmwkxRiBytC2zJUUrBDQJWqAA1fHDooObk0aLi8zQsKdtKcQAAfL9OwzVkYMJ9+EezUZyL4lrfPgARbF8GdocpMBcglKWBrGkaM51xlpgKU6siHZhw1IseOZfBgPUJyjU/YrgJs2RkYxe/37AjDoM2+1t7eMVFWBfiHEJPvtA2qVgHFEImOsYoBxNeKO/G0uHpbl+sCEo23NZ4Zi8rGAIpPPXHwQq7ydj+P0XcrvfHGaY1DDKBIcHP5OXSQJ7WTVu1F+Cl5S5eWnKfYxxhoj7lmzNoaX08CwIZAYBzxwZfiM1jxOzw0lBCUFcFQ8VDI6g2PMf/RuGPH7/F6JABUTzhdW6zuCyOHvmfHn3+WRcfH1T/xMKiQ+GK8wUZ/o+kecdXOeCa5PFps6ja8smsjUxTLPTFVM+tS0Hw3tPn7tyVrkOqByNG2vP1lfHj8aXJmux7D+95PB0/wSAtQrO4jk7wR/WFstLErPDCYcDhoYyb70wIUmbEK2hdYki7n97KZBE+XdPRxd83Z0z+UyZ60fWB85mFPx1s4xgc4dtzo33MD/XdkszyjB2qF6upn3wY3/lY7tsse/d7nbefMuzeXvTk9UAgIrl59HouE9mE6Zto7NLkUs/Y8DVGNa0Wbz3cklx66AAohI17vYoVHBvBzdi6hFX7+Zxc5lmPZkx/12JGzCWtCWv3+QVmW1uA4YSaunZ8We2I/OZ3k1QtP2KwboMiMlSD3SeRoR/8QFMfTaYNNgzUuaWm2ETedvXkBFAKEJzKHa9l0GljERLmWOVac+W7fL+kgZUvLG6AQ1rZnzw91M2ddhp9vZxNe7ucwAODraXqq9YqOlXqXekq2SfcgklxQOx7xdG7CE/otCJ/UaGmVsMe97Ri8Z32Lv7+gRxmGPDAeUGugf6uDyZdX0r0zjN4uuaUlhcITHAr2QA2mWG8h+PHAnYwrj+PV10YtvZz2uMgHZId0b/N7gQ/N0ss0gJpC/1/dMvQQmvRdeE91ppZu7R4TY6InWxubtiEcnxruLkA50wFquhz3eJomKPoAlsy9xyqPxOj6Gb4merLtiivfNnv9aM3OogHUKhDr8GEpuXU4Fq/Ir0J4PnVJDi2zGXtMholJ/yXJsR3Pbr8yQ2Q2GUUHGF+5uqDZJO8hRfHg2WoXYM6NP2/wdwhGYClj6pck1teMyT6aa8neci8pwGRABf07DMbxVpljqMXp/MLKf4fxP67/7hjSaKwgAAAAAElFTkSuQmCC) no-repeat left center;
		background-size: 40upx auto;
	}
</style>
