// 1. http 모듈 가져오기
const http = require('http');
// 4. fs 모듈 가져오기
const fs = require('fs');
// 6. child_process 모듈 가져오기
const spawn = require('child_process').spawn;


// 5. 파이썬 파일 생성 함수, promise 반환
const createFile = (inputCode) => {
    return new Promise((resolve, reject) => {
        // 생성할 파이썬 파일명
        const filePath = './judger_python_file.py';

        // 파일 생성
        fs.writeFile(filePath, inputCode, 'utf8', (err) =>{
            if(err) {
                reject(err);
                return;
            }
                
            resolve(filePath);
        });
    });
};

// 7. 파일 실행 함수, promise 반환
const runFile = (filePath) => {
    return new Promise((resolve, reject) => {
        const result = spawn('python3', [filePath]); // 파일 실행
        let resultString = '';
        
        result.stdout.on('data', function(data){ // 결과 읽기
            resultString += data.toString();
        });

        result.on('close', () => {
            resolve(resultString);
        });

        result.on('error', (err) => {
            reject(err);
        });

    });
};

// 2. 서버 생성
const server = http.createServer((req, res) => {
    if(req.url === '/' && req.method==='GET'){
        res.writeHead(200, {'Content-Type' : 'text/html; charset=utf-8'});
        res.end("");

    } else if(req.url==='/code' && req.method == 'POST') {
        let inputCode = '';
        req.on('data', (chunk) => { // 입력값 받아오기
            inputCode += chunk.toString();
        });

        req.on('end', async () => { // 입력 다 받았을 때 시작
            try{
                const filePath = await createFile(inputCode); // 파일 생성, promise 끝날 때 까지 기다리고 값 받아옴
                console.log(`${filePath} 파일 성공적으로 생성`);

                const runResult = await runFile(filePath); // creatFile 함수 끝나고, 파일 실행
                console.log(`파일 결과 : ${runResult}`);

                // 8. 결과 반환
                res.writeHead(201, {'Content-Type' : 'application/json; charset=utf-8'});
                res.end(JSON.stringify({ result : runResult}));
            }
            catch(err){
                console.error(err);
                res.writeHead(500, {'Content-Type' : 'application/json; charset=utf-8'});
                res.end(JSON.stringify({ error : err.message}));
            }
        });
    }
});

// 3. 서버 실행
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT}/ 에서 작동 중입니다.`);
});
