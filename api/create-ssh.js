export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {
    const {
      username,
      password,
      duration,
      limitIp
    } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username dan password wajib diisi"
      });
    }

    const days = Number(duration);
    const ipLimit = Number(limitIp);

    if (!Number.isInteger(days) || days < 1 || days > 30) {
      return res.status(400).json({
        success: false,
        message: "Durasi harus 1 sampai 30 hari"
      });
    }

    if (!Number.isInteger(ipLimit) || ipLimit < 1) {
      return res.status(400).json({
        success: false,
        message: "Limit IP tidak valid"
      });
    }

    const apiUrl = process.env.SSH_API_URL;
    const apiKey = process.env.SSH_API_KEY;

    if (!apiUrl || !apiKey) {
      return res.status(500).json({
        success: false,
        message: "API SSH belum dikonfigurasi"
      });
    }

    const params = new URLSearchParams({
      auth: apiKey,
      user: username,
      password,
      exp: String(days),
      limitip: String(ipLimit)
    });

    const response = await fetch(`${apiUrl}?${params.toString()}`);

    const data = await response.json();

    if (!response.ok || data.status !== "success") {
      return res.status(400).json({
        success: false,
        message: "Gagal membuat akun SSH",
        data
      });
    }

    return res.status(200).json({
      success: true,
      data: data.data
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}
