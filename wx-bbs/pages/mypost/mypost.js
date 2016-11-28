var index = require("../../data/index-list.js")
var util = require("../../utils/util.js")
var crypt = require("../../utils/crypt.js")


var app = getApp();
Page({
  data:{
      selected:1,
      showRecommend:{},
      emoij:{id:""},
      commentText:"",
      selectedImgs:[],
      currentMoreComment:null,
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    this.init();
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },

  init: function() {
      var that = this;
      app.getInit(function(result){
        that.setData({"user":result.obj._LookUser,"minisns":result.obj._Minisns, "tmpFile":result.obj.tmpFile})
      })
      that.getArticles();

  },

    /**
   * 切换列表
   */
  showList:function(e){
        var that = this;
        let id = e.currentTarget.dataset.id;
        if (id == 1) {
            that.setData({selected:1})
            
            that.getArticles(); 
        } else {
            that.setData({selected:2})
            
            that.getChargeArt();
        }
  },

  /**
   * 获取我的帖子
   */
  getArticles: function(){
    var that = this;
    var tmpFile = that.data.tmpFile;
    var minisId = that.data.minisns.Id;
    var unionid = that.data.user.unionid;
    var verifyModel = util.primaryLoginArgs(unionid);
    wx.uploadFile({
      url: 'http://apptest.vzan.com/minisnsapp/myarticles',
      filePath:tmpFile,
      name:'file',
      // header: {}, // 设置请求的 header
      formData: {"deviceType":verifyModel.deviceType, "timestamp":verifyModel.timestamp, 
                "uid": unionid, "versionCode":verifyModel.versionCode, "sign":verifyModel.sign,"fid":minisId}, // HTTP 请求中其他额外的 form data
      success: function(res){
          var result = JSON.parse(res.data);
          let list=[]
          for(let i=0; i<result.objArray.length;i++) {
              let article = result.objArray[i]
              if (article.Address) {
                  let address = JSON.parse(article.Address);
                  article.Address=address;
              }
              let articleComments = article.articleComments;
              if (articleComments) {
                articleComments = articleComments.reverse()
                article.articleComments = articleComments;
              }
              list.push(article)
          }
          console.log("获取我的发帖列表", list);
          that.setData({articles:list})
      }
    })


  },

  /**
   * 获取我的付费贴
   */
  getChargeArt: function() {

  },

    /**
   * 操作帖子
   */
  openArrow: function(e) {
    var that = this;
    let artId = e.currentTarget.dataset.artId;
    // 获取权限
    var tmpFile = that.data.tmpFile;
    var minisId = that.data.minisns.Id;
    var unionid = that.data.user.unionid;
    var verifyModel = util.primaryLoginArgs(unionid);
    wx.uploadFile({
      url: 'http://apptest.vzan.com//minisnsapp/checkpermissionbyuser',
      filePath: tmpFile,
      name:'file',
      // header: {}, // 设置请求的 header
      formData: {"deviceType":verifyModel.deviceType, "timestamp":verifyModel.timestamp, 
                "uid": unionid, "versionCode":verifyModel.versionCode, "sign":verifyModel.sign,
                artId:artId}, // HTTP 请求中其他额外的 form data
      success: function(res){
          let result = JSON.parse(res.data);
          console.log("获取帖子权限", result);
          if (result.result == true) {
              let actionList = []
              if (result.obj.BlackOne) { // 举报
                  actionList.push("举报")
              }
              actionList.push("取消")
              wx.showActionSheet({
                  itemList: actionList,
                  success: function(res){
                      if (!res.cancel) {
                        let idx = res.tapIndex;
                        if (actionList[idx] == "举报") {
                            console.log("点击举报")
                        }
                      }
                  }
              })
          }
      }
    })
  },

  /**
   * 评论用户
   */
  commentUser:function(e){
    var that = this;
    var artId = e.currentTarget.dataset.artid;
    var uid = e.currentTarget.dataset.uid;
    var name = e.currentTarget.dataset.name;
    var id = e.currentTarget.dataset.id;

    var emoij = that.data.emoij;
    var commentText = that.data.commentText;
    var selectedImgs = that.data.selectedImgs;
    
    var existId = that.data.showRecommend.id;
    var existCommontid = that.data.showRecommend.commontId;
    if (artId == existId && existCommontid == id) { 
        // 关闭当前评论
        artId = "";
    }
    if (existId != artId || existCommontid != id) {
        // 清空数据 ,打开新的
        emoij = {id:""};
        commentText = "";
        selectedImgs = [];
    }
    that.setData({
        showRecommend:{id:artId,toUserId:uid,commontId:id,toUserName:name},
        emoij:emoij,
        commentText:commentText,
        selectedImgs:selectedImgs,
    })    
  },
  /**
   * 删除图片
   */
    removeImg: function(event){
        var that = this;
        var id = event.currentTarget.dataset.id;
        var imgs = that.data.selectedImgs;
        for (var i=0; i<imgs.length; i++) {
            if(imgs[i].id == id) {
                imgs.splice(i,1)
                break;
            }
        }
        that.setData({selectedImgs:imgs})
    },
    /**
     * 选择Emoij
     */
    selectEmoij:function(e){
        var id = e.currentTarget.dataset.id;
        var eid = this.data.emoij.id;
        if (eid == id) {
            id="";
        }
        this.setData({emoij:{id:id}})
    },
    /**
   * 选择图片
   */
  selectImg: function(e) {
      var that = this;
      var id = e.currentTarget.dataset.id;
      var minisId = wx.getStorageSync('minisns').Id;
      var unionid = wx.getStorageSync('user').unionid;
      var verifyModel = util.primaryLoginArgs(unionid);
      wx.chooseImage({
        count: 9, // 最多可以选择的图片张数，默认9
        sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
        sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
        success: function(res){
          var tmp = res.tempFilePaths;

          for(var i=0; i<tmp.length; i++) {
                // 上传图片s
              wx.uploadFile({
                url: 'http://apptest.vzan.com/minisnsapp/uploadfilebytype',
                filePath:tmp[i],
                name:'file',
                // header: {}, // 设置请求的 header
                formData: {"fid":minisId, "uploadType":"img", "deviceType":verifyModel.deviceType, "timestamp":verifyModel.timestamp, 
                           "uid": unionid, "versionCode":verifyModel.versionCode, "sign":verifyModel.sign}, // HTTP 请求中其他额外的 form data
                success: function(res){
                    var result = JSON.parse(res.data);
                    console.log("上传图片成功", result);
                    // 刷新页面
                    var rtmp = that.data.selectedImgs;
                    rtmp = rtmp.concat({id:result.obj.id,src:result.obj.url});
                    that.setData({selectedImgs:rtmp});
                }
              })
              // 模拟上传成功
              // var rtmp = that.data.selectedImgs;
              // rtmp = rtmp.concat({id:0,src:"http://oss.vzan.cc/image/jpg/2016/6/29/104132817bf9689a7340798e7927d447ef56d7.jpg"});
              // that.setData({selectedImgs:rtmp});
          }
        }
      })
  },
  commentCancle:function(e) {
    console.log("取消评论")
    this.setData({
        showRecommend:{ id:"",toUserId:null,commontId:null,toUserName:null },
        emoij:{ id:"" }, commentText:"", selectedImgs:[] 
    })
  },
  commentSubmit:function(e){
      var that = this;
      var id = e.currentTarget.dataset.id;
      var showRecommend = that.data.showRecommend;
      if (showRecommend.commontId) { // 回复用户
          that.replyComment(id);
      } else {
          that.replyPost(id); // 回复帖子
      }
      // 清空评论数据
      that.setData({
        showRecommend:{ id:"",toUserId:null,commontId:null,toUserName:null },
        emoij:{ id:"" }, commentText:"", selectedImgs:[] 
      })
      console.log("提交评论 -- END");
  },
  // 播放声音
  playAudio: function(event) {
    console.info ("播放声音");
    var voiceId = event.currentTarget.dataset.vId;
    console.info (voiceId);
    var storageVoice =  wx.getStorageSync('playingVoice');
    var audioContext = wx.createAudioContext(voiceId+"");
    // 获取正在播放的内容
    if (typeof storageVoice == "undefined" || storageVoice == "" || storageVoice == null) {
        // 当前未播放
        audioContext.play();
        storageVoice = new Object();
        storageVoice.id=voiceId;
        storageVoice.status=2;
      } else if(storageVoice.id == voiceId) {
        // 暂定状态
        if (storageVoice.status == 1) {
          audioContext.play();
          storageVoice.status=2;
        } else
        // 播放状态 - 转为暂停
        if (storageVoice.status == 2) {
            audioContext.pause();
            storageVoice.status=1;
        }
      } else {
        // 停止当前的，播放另一个
        var usingAudioContext = wx.createAudioContext(storageVoice.id+"")
        usingAudioContext.seek(0);
        usingAudioContext.pause();
        storageVoice = new Object();
        storageVoice.id = voiceId;
        storageVoice.status = 2;
        audioContext.play();
      }
      wx.setStorageSync('String', storageVoice);

  },
  /**
   * 展示大图
   */
    showBigImg: function(e) { // 展示大图
    var src = e.currentTarget.dataset.src;
    wx.previewImage({
       current: src, // 当前显示图片的链接，不填则默认为 urls 的第一张
       urls: [src],
    })
    return false;
  },
  /**
   * 回复用户
   */
    replyComment:function(id) {
      var that = this;
      var minisId = that.data.minisns.Id;
      var unionid = that.data.user.unionid;
      var verifyModel = util.primaryLoginArgs(unionid);
      var imgs = "";
      for (var i=0; i < that.data.selectedImgs.length; i++) {
        if (i=0) {
          imgs = that.data.selectedImgs[i].id;
        } else {
          imgs = imgs + "," + that.data.selectedImgs[i].id;
        }
      }
      var content = that.data.commentText;
      var showRecommend = that.data.showRecommend;
      wx.uploadFile({
        url: 'http://apptest.vzan.com/minisnsapp/replyartcommentbyid',
        filePath: wx.getStorageSync('tmpFile'),
        name:'file',
        // header: {}, // 设置请求的 header
        formData: {"deviceType":verifyModel.deviceType, "timestamp":verifyModel.timestamp, 
        "uid": unionid, "versionCode":verifyModel.versionCode, "sign":verifyModel.sign,
        "artId":id, "toUserId":showRecommend.toUserId, "commontId":showRecommend.commontId, "comment":content, "images":imgs}, // HTTP 请求中其他额外的 form data
        success: function(res){
            var result = JSON.parse(res.data);
            if (result.result == true) { // 发帖成功
                // that.reload();
              //  获取评论列表
                wx.request({
                  url: "http://apptest.vzan.com/minisnsapp/getcmt-"+id,
                  data: {fid:minisId,pageIndex:1},
                  method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                  // header: {}, // 设置请求的 header
                  success: function(res){
                      var arts = that.data.articles;
                      that.setData({articles:arts})
                      for (var i=0; i<arts.length;i++) {
                          var tmp = arts[i];
                          if (tmp.Id==id) {
                            tmp.articleComments = that.generateComments(res.data.CommentList);
                            arts[i] = tmp;
                            // 更新数据
                            that.setData({articles:arts})
                            break;
                          }
                      }
                  }
                })              
            }
        }
      })
  },
/**
 * 回复帖子
 */
replyPost: function(id) {
      var that = this;
      var minisId = wx.getStorageSync('minisns').Id;
      var unionid = wx.getStorageSync('user').unionid;
      var verifyModel = util.primaryLoginArgs(unionid);
      var imgs = "";
      for (var i=0; i < that.data.selectedImgs.length; i++) {
        if (i=0) { imgs = that.data.selectedImgs[i].id;} 
        else { imgs = imgs + "," + that.data.selectedImgs[i].id; }
      }
      var content = this.data.commentText;
      wx.uploadFile({
        url: 'http://apptest.vzan.com/minisnsapp/commentartbyid',
        filePath: wx.getStorageSync('tmpFile'),
        name:'file',
        // header: {}, // 设置请求的 header
        formData: {"deviceType":verifyModel.deviceType, "timestamp":verifyModel.timestamp, 
        "uid": unionid, "versionCode":verifyModel.versionCode,"sign":verifyModel.sign,
        "artId":id,"comment":content,"images":imgs}, // HTTP 请求中其他额外的 form data
        success: function(res){
            var result = JSON.parse(res.data);
            if (result.result == true) { // 发帖成功
               // 获取评论列表
              //  that.reload();
            wx.request({
              url: "http://apptest.vzan.com/minisnsapp/getcmt-"+id,
              data: {fid:minisId,pageIndex:1},
              method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
              // header: {}, // 设置请求的 header
              success: function(res){
                  var arts = that.data.articles;
                  that.setData({articles:arts})
                  for (var i=0; i<arts.length;i++) {
                      var tmp = arts[i];
                      if (tmp.Id==id) {
                        tmp.articleComments = that.generateComments(res.data.CommentList);
                        arts[i] = tmp;
                        // 更新数据
                        that.setData({articles:arts})
                        break;
                      }
                  }
              }
            })              
            }
        }
      })

  },
  /**
   * 整合评论信息
   */
  generateComments: function(commentList) {
      var comment = {};
      console.log("获取帖子评论列表", commentList)
      for (var i=0; i<commentList.length; i++) {
        var tmp = commentList[i];
        // 回复者
        for(var j=0; j<tmp.Comments.length; j++) {
            var rTmp = tmp.Comments[j];
            rTmp.DUser = {"Id":tmp.User.Id,"Headimgurl":tmp.User.Headimgurl,"NickName":tmp.User.Nickname};
   	        rTmp.ComUser = rTmp.User;
            comment[rTmp.Id] = rTmp;
        }
        if (typeof comment[tmp.Id] == "undefined") {
             tmp.ComUser = tmp.User;          
             comment[tmp.Id] = tmp;             
        }
      }
      var list = [];
      for (var key in comment) {
        list.push(comment[key])
      }
      console.log("转换后的评论列表", list);
      return list.reverse();
  },
    /**
   * 保存选择的表情
   */
  emoijSelected:function(e){
      var code = e.currentTarget.dataset.code;
      var tmp = this.data.commentText;
      tmp = tmp + code;
      this.setData({commentText:tmp});
  },
    /**
   * 保存评论的内容
   */
  saveTextValue:function(e) {
      var content = e.detail.value;
      this.setData({commentText:content});
  },
  /**
   * 点赞
   */
    praise:function(e){
      var that = this;
      var minisId = wx.getStorageSync('minisns').Id;
      var unionid = wx.getStorageSync('user').unionid;
      var verifyModel = util.primaryLoginArgs(unionid);
      var id = e.currentTarget.dataset.id; // 帖子ID
      var verifyModel = util.primaryLoginArgs(unionid);
      wx.uploadFile({
        url: 'http://apptest.vzan.com/minisnsapp/articlepraise',
        filePath: wx.getStorageSync('tmpFile'),
        name:'file',
        // header: {}, // 设置请求的 header
        formData: {"deviceType":verifyModel.deviceType, "timestamp":verifyModel.timestamp, 
        "uid": unionid, "versionCode":verifyModel.versionCode,"sign":verifyModel.sign, "artId":id}, // HTTP 请求中其他额外的 form data
        success: function(res){
            var tmp = that.data.articles;
            var result = JSON.parse(res.data);
            console.log("点赞成功", result)
            // 修改状态
            if(result.result==true) {
                for(var i=0; i < tmp.length; i++) {
                  if (tmp[i].Id==id) {
                    tmp[i].IsPraise=true;
                    tmp[i].Praise = tmp[i].Praise + 1; 
                  }
                }
                that.setData({articles:tmp})
            } else {
                wx.showModal({title:"提示",content:result.msg, showCancel:false, confirmText:"取消"})
            }
        }
      })
  },
    /**
   * 评论帖子
   */
  showReComment:function(e){
      var that = this;
      var id = e.currentTarget.dataset.id;
      var existId = that.data.showRecommend.id;
      var emoij = that.data.emoij;
      var commentText = that.data.commentText;
      var selectedImgs = that.data.selectedImgs;
      var existCommontid = that.data.showRecommend.commontId;
      if (existId == id && existCommontid == null){ // 关闭
        id = "";
      }
      if (existId != id) { // 打开新的
        emoij = {id:""},
        commentText = "";
        selectedImgs = [];
      } 
      // var tmp = that.data.articles;
      that.setData({
        showRecommend:{id:id, toUserId:null, commontId:null, toUserName:null}, 
        emoij:emoij, 
        commentText:commentText, 
        selectedImgs:selectedImgs
      })
  },
    /**
   * 更多评论信息
   */
  moreComment: function(e) {
      this.setData({currentMoreComment:e.currentTarget.dataset.id})
  },
})