import { generateStreamToken, verifyStreamToken } from "../services/streamToken"
import { getRotatedSource } from "../services/streamProxy"

export async function getStream(req: any, res: any) {
  const user = req.user
  const { channelId } = req.query

  const token = generateStreamToken(user.id, channelId, req.ip, req.headers["user-agent"])

  res.json({
    url: `/api/stream/play?token=${token}`
  })
}

export async function playStream(req: any, res: any) {
  const { token } = req.query

  const data = verifyStreamToken(token, req.ip, req.headers["user-agent"])
  if (!data) return res.status(403).send("Forbidden")

  const realStreamUrl = await getRotatedSource()

  res.redirect(realStreamUrl)
}
