import { server } from "./http";
import './websocket/ChatService'

server.listen(3000, () => console.log(`rocketsocket v.${process.env.npm_package_version} running on port 3000`))