let CorrectArray = [24,17,5,173,167,171,174,176]

function setup() {
    createCanvas(800, 900);
    // load up your video
    video = createCapture(VIDEO);
    video.size(width, height);
    poseNet = ml5.poseNet(video, modelReady)
    // 新しいポーズが検出されるたびにposesを配列で埋める
    poseNet.on('pose', function(results){　
        poses = results
        draw()
    })
    video.hide(); // Hide the video element, and just show the canvas
}

function modelReady() {
    console.log('ready!')
    // poseNet.singlePose(img)
}

function draw(){
    // console.log(poses);
    image(video, 0, 0, width, height)
    // We can call both functions to draw all keypoints and the skeletons
    drawKeypoints();
    drawSkeleton();
    makeDegreeArray();
}

function drawKeypoints() {
    // 検出されたすべての姿勢を走査する
    for (let i = 0; i < poses.length; i++) {
        // 検出された各姿勢について、すべてのキーポイントを走査する。
        let pose = poses[i].pose;
        // 顔部分
        for (let j = 0; j < pose.keypoints.length; j++) {
            // keypointは、部位を表すオブジェクト(rightArmやleftShoulderなど)
            let keypoint = pose.keypoints[j];
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
    let degreearray = []
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
    // 正誤判定
    check(CorrectArray, degreearray)
}

// "180"と"-180"が全然違う問題を忘れない！！！！！！！！！！！！！！！！！
function calcDegree(a, b, c) {
    // p5js createVector(x,y)
    let v1 = createVector(a.x - b.x, a.y - b.y);
    let v2 = createVector(c.x - b.x, c.y - b.y);
    // cosθ
    cos = (v1.x * v2.x + v1.y * v2.y)/(Math.sqrt(v1.x**2 + v1.y**2) * Math.sqrt(v2.x**2 + v2.y**2));
    // 角度=arccos(cos)*(180/π)
    degree = parseInt(Math.acos(cos) * (180 / Math.PI));

    return degree;
}

// 正誤判定とその後のアクション
function check(ca, da) {
    let sum = 0
    let arraycount = 0

    for (let i = 0; i < ca.length; i++) {
        if (da[i] != NaN){
            sum += ca[i] - da[i]
            arraycount++
        }
    }
    
    // 正しかった時(今は検出された箇所が6カ所以上かつ誤差平均が20未満の時)に実行
    if(arraycount > 5 && Math.abs(sum/arraycount) < 20) {
        console.log('correct');
    }
}