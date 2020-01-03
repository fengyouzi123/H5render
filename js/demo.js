//页面加载动画
let loadingRender = (function () {
    let $loadingBox = $('.loadingBox'),
        $current = $loadingBox.find('.current');
    //图片数据
    let imgData = ["image/00_00.jpg", "image/00_01.jpg", "image/00_02.jpg", "image/00_03.jpg", "image/00_04.jpg",
        "image/00_05.jpg", "image/00_06.jpg", "image/00_07.jpg", "image/00_08.jpg", "image/00_09.jpg",
        "image/00_10.jpg", "image/00_11.jpg", "image/00_12.jpg", "image/00_13.jpg", "image/00_14.jpg",
        "image/00_15.jpg", "image/00_16.jpg", "image/00_17.jpg", "image/00_18.jpg", "image/00_19.jpg",
        "image/00_20.jpg", "image/00_21.jpg", "image/00_22.jpg", "image/00_23.jpg", "image/00_24.jpg",
        "image/00_25.jpg", "image/00_26.jpg", "image/00_27.jpg"];
    //预加载图片
    let n = 0,
        len = imgData.length;
    let run = function run(callback) {

        imgData.forEach(item => {
            let tempImg = new Image;
            tempImg.onload = () => {
                tempImg = null;
                $current.css('width', (++n) / len * 100 + '%');

                //加载完成，执行回调函数（让当前loading页面消失）
                if (n === len) {
                    clearTimeout(delayTimer);
                    callback && callback();
                }
            };
            tempImg.src = item;
        });
    }
    //设置最长等待时间（时间或者是加载百分比90%以上，就可以正常加载， 如果不足这个比列，直接提示用户当前网络不佳）
    let delayTimer = null;
    let maxDalay = function (callback) {
        delayTimer = setTimeout(() => {
            if (n / len >= 0.9) {
                $current.css('width', '100%');
                callback && callback();
                return;
            }
            alert('网络不佳');
            //window.location.href = 'http://www.baidu.com'; //此时可以让其关掉页面或跳转到其它页面
        }, 10000);
    };

    //完成
    let done = function done() {
        let timer = setTimeout(() => {
            //页面加载完停留一会儿，进入下一环杰
            $loadingBox.remove();
            clearInterval(timer);

            phoneRender.init();
        }, 1000);
    };

    return {
        init: function () {
            $loadingBox.css('display', 'block');
            run(done);
            maxDalay(done);
            // done();
        }
    }
})();
//电话接听
let phoneRender = (function () {
    let $phoneBox = $('.phoneBox'),
        $time = $phoneBox.find('span'),
        $answer = $phoneBox.find('.answer'),
        $answerMarkLink = $answer.find('.markLink'),
        $hang = $phoneBox.find('.hang'),
        $hangMarkLink = $hang.find('.markLink'),
        answerBell = $('#answerBell')[0],
        introduction = $('#introduction')[0];
        console.dir(answerBell);
    /***
     * 关于audio的一些常用属性
     *  duration：播放的总时间
     *  currentTime：当前已经播放的时间
     *  ended：是否已经播放完成
     *  paused：当前是否为暂停状态
     * volume：控制音量（0-1）
     * 
     * 方法：
     * pause（）：暂停
     * play（）：播放 
     * 
     *  事件：
     *      canplay：可以正常播放
     *      canplaythrough：资源加载完成，可以顺畅播放了
     *      loadedmetadata：资源的基础信息已经加载完成
     *      loadeddata：整个资源都加载完成了
     *      pause：触发了暂停
     *      play：触发了播放
     *      playing ：正在播放中
     */

    let answerMarkTouch = function () {
        $answer.remove();
        answerBell.pause();
        $(answerBell).remove(); //先暂停播放，再移除，否则即使移除了浏览器也会播放这个声音
        $hang.css('transform', 'translateY(0rem)');
        $time.css('display', 'block');
        introduction.play();
        computedTime();
    };
    //计算时间
    let autoTime = null;
    let computedTime = function () {
        let duration = 0;
            introduction.oncanplay = function () {
            duration = introduction.duration;
        };
        autoTime = setInterval(() => {
            let val = introduction.currentTime;
            if (val >= duration) {
                clearInterval(autoTime);
                closePhone();
                return;
            }
                minute = Math.floor(val / 60),
                second = Math.floor(val - minute * 60);
                minute = minute < 10 ? '0' + minute : minute;
                second = second < 10 ? '0' + second : second;
                $time.html(`${minute}:${second}`);
        }, 1000);
    };
    //关闭
    let closePhone = function () {
        clearInterval(autoTime);
        introduction.pause();
        $(introduction).remove();
        $phoneBox.remove()
        messageRender.init();
    };
    return {
        init: function () {
            $phoneBox.css('display', 'block');
            answerBell.play();
            answerBell.volume = 0.3;
            $answerMarkLink.on('click', answerMarkTouch);
            $hangMarkLink.on('click', closePhone);
        }
    }
})();
//聊天界面
let messageRender = (function () {
    let $messageBox = $('.messageBox'),
        $wrapper = $messageBox.find('.wrapper'),
        $messageList = $wrapper.find('li'),
        $keyBoard = $messageBox.find('.keyBoard'),
        $textInp = $keyBoard.find('span'),
        $submit = $keyBoard.find('.submit');

    let step = -1,  //记录当前展示信息的索引
        total = $messageList.length + 1,  //记录的是信息总条数（加1 是自己发的）

        autoTimer = null, //定时器
        interval = 1000; //记录信息出现的时间间隔

    //展示信息
    let showMessage = function () {
        ++step;
        if (step === 2) {
            handleSend();
            clearInterval(autoTimer);
            return;
        }
        let $cur = $messageList.eq(step); //展示当前的信息
        $cur.addClass('active');

        if (step >= 3) {
            let curH = $cur[0].offsetHeight,
                wraT = parseFloat($wrapper.css('top'));
            $wrapper.css('top', wraT - curH);
        }

        if (step >= total - 1) {
            clearInterval(autoTimer);  //展示完成
            closeMessage();

        }
    };

    //手动发送
    let handleSend = function () {
        $keyBoard.css('transform', 'translateY(0rem)')
            .one('transitionend', () => { //监听当前元素动画结束的事件,(有几个
                //样式属性改变，并且执行了过渡效果，事件就会被触发执行几次，
                //用one方法事件绑定，只会让其触发一次)
                let str = 'transitionend：监当前动画事件',
                    n = -1,
                    textTimer = null;
                textTimer = setInterval(() => {
                    let orginHTML = $textInp.html();

                    $textInp.html(orginHTML + str[++n]);

                    if (n >= str.length - 1) {
                        clearInterval(textTimer);
                        $submit.css('display', 'block');
                    }
                }, 200);

            });
    };

    //点击发送
    let handleSubmit = function () {
        //把创建的li增加到页面中
        $(`<li class="self">
            <i class="arrow"></i>
            <img src="image/left.jfif" alt="" class="pic">
            ${$textInp.html()}
        </li>`).insertAfter($messageList.eq(1)).addClass('active');
        $messageList = $wrapper.find('li');//重新把新的li放到页面中，此时让

        // 键盘消失，文本框文字消失，按钮消失
        $textInp.html('');
        $submit.css('display', 'none');
        setTimeout(() => {
            $keyBoard.css('transform', 'translateY(4.4rem)');

            autoTimer = setInterval(showMessage, interval);

        }, 200);


    };
    //关掉当前页面
    let closeMessage = function () {
        let delayTimer = setTimeout(() => {
            $messageBox.remove();
            clearInterval(delayTimer);
            cubeRender.init();
        }, interval);
    };

    return {
        init: function () {
            $messageBox.css('display', 'block')
            showMessage() //加载模块立即展示一条信息，后期间隔在发送一条信息
            autoTimer = setInterval(showMessage, interval);
            $submit.on('click', handleSubmit);
        }
    }
})();
//魔方滚动
let cubeRender = (function (){
    let $cubeBox = $('.cubeBox'),
        $cube = $cubeBox.find('.cube'),
        $cubeList = $cube.find('li')
    let start = function (ev) {
        let point = ev.changedTouches[0];
        this.strX = point.clientX;
        this.strY = point.clientY;
        this.changeX = 0;
        this.changeY = 0;
    };

    let move = function (ev) {
        let point = ev.changedTouches[0];
        this.changeX = point.clientX - this.strX;
        this.changeY = point.clientY - this.strY;
    };
    let end = function (ev) {
        let {changeX, changeY, rotateX, rotateY} = this,
            isMove = false;
            //验证是否发生移动
        Math.abs(changeX) > 10 || Math.abs(changeY) > 10 ? isMove = true : null;

        if (isMove) {
            //左右划：成正比 change越大rotate越大
            //上下划： 成反比  cahnge越大rotate越小
            rotateX = rotateX + changeY / 3;
            rotateY = rotateY - changeX / 3;
            //赋值给正方形
            $(this).css('transform', `scale(0.6) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
            //让当前旋转的角度称为下一次起始的角度
            this.rotateX = rotateX;
            this.rotateY = rotateY;
        }
    };
    return {
        init: function() {
            $cubeBox.css('display','block');
            let cur = $cube[0];
            cur.rotateX = -35;
            cur.rotateY = 35;
            //手指操作cube旋转
            $cube.on('touchstart', start)
                .on('touchmove', move)
                .on('touchend', end);
            
            //点击每一个面跳转到详细页
            $cubeList.on('click',function () {
                $cubeBox.css('display', 'none');
                let index = $(this).index();
                detailBox.init(index);
         

            });

        }
    }
})();
//页面切换
let detailBox = (function () {
    let $detailBox = $('.detailBox'),
        $dl = $('.page1>dl'),
        swiper = null;
        
    let swiperInit = function () {
        swiper = new Swiper('.swiper-container', {
            initialSlide: 0,  //初始的索引
            effect: "coverflow",
            onInit: move,
            onTransitionEnd: move
        });
    };

let move = function (swiper) {
    let activeIn = swiper.activeIndex,
        slideAry = swiper.slides;
    //滑动到哪个页面，把当前页面设置对应的ID，其余页面移除ID即可
        slideAry.forEach((item, index) => {
            if(activeIn === index) {
                item.id = `page${index + 1}`;
                return;
            }
            item.id = null;
        });
    
};

    return {
        init: function (index) {
            $detailBox.css('display', 'block');
            if(!swiper) {
                swiperInit();//防止重复初始化
            }
            swiper.slideTo(index);

            //折叠效果
            // $dl.makisu({
            //     selector: 'dd',
            //     overlap: 0.6,
            //     speed: 0.8
            // });
            // $dl.makisu('oppe');
        }
    }
})();


//     开发中，当项目板块很多（每个板块都是一个单列），最好规划一种机制：通过标识的判断可以
// 让程序只执行对应板块内容，开发哪个板块，就把标识改为谁（HASH路由控制） 
//获取当前页面的url地址  location.href = 'xxxx' 这种写法是让其跳转到某个页面
let url = window.location.href,
    well = url.indexOf('#'),
    hash = well === -1 ? null : url.substr(well + 1);
switch (hash) {
    case "loading":
        loadingRender.init();
        break;
    case 'phone':
        phoneRender.init();
        break;
    case 'message':
        messageRender.init();
        break;
    case 'cube':
        cubeRender.init();
        break;
    case 'detail':
        detailBox.init();
        break;
    default:
        loadingRender.init();

}
