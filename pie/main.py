import asyncio
from server import ShotClockServer

if __name__ == "__main__":
    server = ShotClockServer(host="0.0.0.0", port=8765)
    asyncio.run(server.serve())
