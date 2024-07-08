const express = require('express');
const sharp = require('sharp');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.post('/process-images', async (req, res) => {
  const { topImageUrl, bottomImageUrl } = req.body;

  try {
    // 両方の画像をダウンロード
    const [topImageResponse, bottomImageResponse] = await Promise.all([
      axios.get(topImageUrl, { responseType: 'arraybuffer' }),
      axios.get(bottomImageUrl, { responseType: 'arraybuffer' })
    ]);

    // 画像を処理
    const topImage = await sharp(topImageResponse.data)
      .resize(500, 500, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    const bottomImage = await sharp(bottomImageResponse.data)
      .resize(500, 500, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    // 処理された画像をBase64エンコードして送信
    res.json({
      topImage: `data:image/png;base64,${topImage.toString('base64')}`,
      bottomImage: `data:image/png;base64,${bottomImage.toString('base64')}`
    });

  } catch (error) {
    console.error('詳細なエラー:', error);
    if (error.response) {
      // サーバーからのレスポンスがあった場合
      console.error('サーバーレスポンス:', error.response.data);
      console.error('ステータスコード:', error.response.status);
    } else if (error.request) {
      // リクエストは送信されたがレスポンスがない場合
      console.error('リクエストエラー:', error.request);
    } else {
      // リクエスト設定時にエラーが発生した場合
      console.error('エラーメッセージ:', error.message);
    }
    res.status(500).json({ error: 'Image processing failed', details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`サーバーが http://localhost:${PORT} で起動しました`);
});
