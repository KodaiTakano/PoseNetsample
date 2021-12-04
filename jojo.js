let img;
let poseNet;
let poses = [];

function setup() {
    console.log('セットアップ');
    // ドキュメント内にcanvas要素を作成し、サイズをピクセル単位で設定する。
    // https://p5js.org/reference/#/p5/createCanvas
    // createCanvas(480, 640);
    // createCanvas(668, 668);
    // createCanvas(298, 228);
    createCanvas(334,500);

    // var url = 'https://i0.wp.com/marutarou.com/wp-content/uploads/2020/10/o0480064012586510803.jpg?w=480&ssl=1';
    // var url = 'https://i0.wp.com/marutarou.com/wp-content/uploads/2020/10/c20130901_jojoasbplay16_001_cs1w1_720x720.jpg?w=720&ssl=1';
    // var url = 'https://i0.wp.com/marutarou.com/wp-content/uploads/2020/10/c20130827_jojoasbplay23_001_cs1w1_298x.jpg?resize=298%2C223&ssl=1';
    var url = 'https://stat.ameba.jp/user_images/20151103/18/bijinzukan/e9/2d/j/t02200329_0334050013473375405.jpg?caw=800'

    // p5 domライブラリを使ってイメージを作成し、読み込まれたらmodelReady()を呼び出す。
    // 与えられたsrcと代替テキストでDOMに<img>要素を作成して、コンテナノードが指定されている場合にはそれに追加し、
    // 指定されていない場合には、bodyに追加する。
    // createImg(src, successCallback)
    // https://p5js.org/reference/#/p5/createImg
    // var img = new Image();
    // img.crossOrigin = 'anonymous';
    // img.src = url;
    // img.onload = function() {
        img = createImg(url, imageReady);
        img.size(width, height);
        img.hide(); // イメージを隠す
    // };

    // イメージのサイズをキャンバスのサイズに設定する。
    // 要素の幅と高さを設定する。
    // size(w, [h])
    // https://p5js.org/reference/#/p5.Element/size

    // width：描画するキャンバスの幅を保持するシステム変数。
    // この値はcreateCanvas()関数の最初のパラメータによって設定される。
    // heigthも同様。
    // https://p5js.org/reference/#/p5/width
    // img.size(width, height);

    // img.hide(); // イメージを隠す
    // 毎秒表示するフレーム数を指定する。
    // https://p5js.org/reference/#/p5/frameRate
    // フレームレートの設定はsetup()内が好ましい。
    frameRate(1); // 高速で実行する必要はないので、フレームレートを1にする。
}

// イメージの準備ができたらposeNetを読み込む。
function imageReady() {
    console.log('イメージの準備完了');
     // オプションを設定する。
     let options = {
        architecture: 'MobileNetV1',
        imageScaleFactor: 0.3,
        outputStride: 16,
        flipHorizontal: false,
        minConfidence: 0.5,
        maxPoseDetections: 5,
        scoreThreshold: 0.5,
        nmsRadius: 20,
        detectionType: 'multiple',
        inputResolution: 513,
        multiplier: 0.75,
        quantBytes: 2,
    };

    // poseNetを割り当てる。
    poseNet = ml5.poseNet(modelReady, options);
    // poseイベントを監視するリスナーを設定する。
    poseNet.on('pose', function(results) {
        poses = results;
    });
}

// poseNetの準備ができたら、検出を行う
function modelReady() {
    console.log('モデルの読み込み完了');
    select('#status').html('モデルが読み込まれた');

    // モデルの準備ができたら、イメージの単一姿勢検出を実行する。
    // poseNet.on('pose', ...)で検出結果を監視しているので、姿勢が検出されると、
    // draw()ループでposesが存在する場合のみ、drawSkeleton()とdrawKeypoints()が実行される。
    poseNet.singlePose(img)
}

// draw()は、posesが見つかるまで何も描画しない
// setup()の直後呼び出され、draw()関数は、プログラムが停止されるかnoLoop()が呼び出されるまで、
// そのブロックに含まれるコード行を連続して実行する。
// https://p5js.org/reference/#/p5/draw
function draw() {
    if (poses.length > 0) {
        for (let i = 0; i < poses.length; i++) {
            // poseが持つ情報を出力
            let pose = poses[i].pose;
            console.log('全体の精度' + pose.score);
            for (let j = 0; j < pose.keypoints.length; j++) {
                let keypoint = pose.keypoints[j];
                console.log('部位名：' + keypoint.part);
                console.log('精度：' + keypoint.score);
                console.log('x位置：' + keypoint.position.x);
                console.log('y位置：' + keypoint.position.y);
                console.log('-----------------------');
            }
        }

        for (let i = 0; i < poses.length; i++) {
            // skeletonが持つ情報を出力
            let skeleton = poses[i].skeleton;
            for (let j = 0; j < skeleton.length; j++) {
                console.log(j + 1 + '回目');
                console.log('部位名：' + skeleton[j][0].part);
                console.log('精度' + skeleton[j][0].score);
                console.log('x位置：' + skeleton[j][0].position.x);
                console.log('y位置：' + skeleton[j][0].position.y);
                console.log('-----------------------');

                console.log('部位名：' + skeleton[j][1].part);
                console.log('精度：' + skeleton[j][1].score);
                console.log('x位置：' + skeleton[j][1].position.x);
                console.log('y位置：' + skeleton[j][1].position.y);
                console.log('-----------------------');
            }
        }

        // イメージをp5.jsのキャンバスに描画する。<= createCanvas(640, 360)で作成したキャンバス
        // image(img, x, y, [width], [height])
        // https://p5js.org/reference/#/p5/image
        image(img, 0, 0, width, height);
        drawSkeleton();
        drawKeypoints();
        makeDegreeArray();
        // p5.jsがdraw()内のコードの連続的な実行を行うのを停める
        // https://p5js.org/reference/#/p5/noLoop
        noLoop(); // posesの推定時はループを停める
    }
}

// 以下はhttps://ml5js.org/docs/posenet-webcamからのコード
// 検出されたキーポイントの上に円を描く
function drawKeypoints() {
    // 検出されたすべての姿勢を走査する
    for (let i = 0; i < poses.length; i++) {
        // 検出された各姿勢について、すべてのキーポイントを走査する。
        let pose = poses[i].pose;
        // 顔部分
        for (let j = 0; j < pose.keypoints.length; j++) {
            // keypointは、部位を表すオブジェクト(rightArmやleftShoulderなど)
            let keypoint = pose.keypoints[j];
            // 姿勢の確率が0.2より大きいものだけ円を描く。
            if (keypoint.score > 0.2) {
                // シェイプの塗りに使用するカラーを設定する。
                // https://p5js.org/reference/#/p5/fill
                if (j < 5) { 
                    fill(0,0,0);
                    // 線とシェイプの枠線の描画に使用するカラーを設定する。
                    // https://p5js.org/reference/#/p5/stroke
                    stroke(20);
                    // 線や点、シェイプの枠線に使用する線幅を設定する。
                    // https://p5js.org/reference/#/p5/strokeWeight
                    strokeWeight(4);
                    // スクリーンに楕円を描画する。
                    // ellipse(x, y, w, [h])
                    // https://p5js.org/reference/#/p5/ellipse
                    // パラメータnに最も近い整数を計算する。
                    // round(n)
                    // https://p5js.org/reference/#/p5/round
                    ellipse(round(keypoint.position.x), round(keypoint.position.y), 8, 8);
                }
                if (5 <= j && j < 11) {
                    fill(0,0,255);
                    stroke(20);
                    strokeWeight(4);
                    ellipse(round(keypoint.position.x), round(keypoint.position.y), 8, 8);
                }
                if (11 <= j && j < 17) {
                    fill(255,0,0);
                    stroke(20);
                    strokeWeight(4);
                    ellipse(round(keypoint.position.x), round(keypoint.position.y), 8, 8);
                }
            }
        }
    }
}

// 骨格を描く
function drawSkeleton() {
    // 検出されたすべての骨格(skeleton)を走査する。
    for (let i = 0; i < poses.length; i++) {
        let skeleton = poses[i].skeleton;
        // すべてのskeletonに関し、部位の接続を走査する。
        for (let j = 0; j < skeleton.length; j++) {
            let partA = skeleton[j][0];
            let partB = skeleton[j][1];
            stroke(255);
            strokeWeight(1);
            // スクリーンに線(２点を結ぶ直線)を描画する。
            // line(x1, y1, x2, y2)
            // https://p5js.org/reference/#/p5/line
            line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
        }
    }
}

function makeDegreeArray() {
    degreearray = []
    for (let i = 0; i < poses.length; i++) {
        // 検出された各姿勢について、すべてのキーポイントを走査する。
        let pose = poses[i].pose;

        // 左肘、左肩、左腰の角度
        degreearray.push(calcDegree(pose.keypoints[7].position, pose.keypoints[5].position, pose.keypoints[11].position))
        // 右肘、右肩、右腰の角度
        degreearray.push(calcDegree(pose.keypoints[8].position, pose.keypoints[6].position, pose.keypoints[12].position))
        // 左手首、左肘、左肩の角度
        degreearray.push(calcDegree(pose.keypoints[5].position, pose.keypoints[7].position, pose.keypoints[9].position))
        // 右手首、右肘、右肩の角度
        degreearray.push(calcDegree(pose.keypoints[6].position, pose.keypoints[8].position, pose.keypoints[10].position))
        // 左肩、左腰、左膝の角度
        degreearray.push(calcDegree(pose.keypoints[5].position, pose.keypoints[11].position, pose.keypoints[13].position))
        // 右腰、右腰、右膝の角度
        degreearray.push(calcDegree(pose.keypoints[6].position, pose.keypoints[12].position, pose.keypoints[14].position))
        // 左腰、左膝、左足首の角度
        degreearray.push(calcDegree(pose.keypoints[11].position, pose.keypoints[13].position, pose.keypoints[15].position))
        // 右腰首、右膝、右足首の角度
        degreearray.push(calcDegree(pose.keypoints[12].position, pose.keypoints[14].position, pose.keypoints[16].position))
    }
    console.log('degreearray: '+degreearray)
}

// "180"と"-180"が全然違う問題を忘れない！！！！！！！！！！！！！！！！！
function calcDegree(a, b, c) {
    v1 = createVector(a.x - b.x, a.y - b.y);
    v2 = createVector(c.x - b.x, c.y - b.y);
    // cosθ
    cos = (v1.x * v2.x + v1.y * v2.y)/(Math.sqrt(v1.x**2 + v1.y**2) * Math.sqrt(v2.x**2 + v2.y**2));
    // 角度=arccos(cos)*(180/π)
    degree = Math.acos(cos) * (180 / Math.PI);

    return degree;
}
