from config import Config
from zep_cloud import AsyncZep

class KnowledgeGraph:
    zep = AsyncZep(api_key=Config.ZEP_API_KEY)

    def __init__(self, user_id: str):
        self.__user_id = user_id

    async def search_facts(self, query: str, limit: int = 5) -> list[str]:
        result = await self.zep.graph.search(
            user_id=self.__user_id,
            query=query,
            limit=limit,
            scope="edges",
        )

        facts = [edge.fact for edge in result.edges or[]]
        if not facts:
            return ["No facts found for the query."]
        return facts

    async def search_nodes(self, query: str, limit: int = 5) -> list[str]:
        result = await self.zep.graph.search(
            user_id=self.__user_id,
            query=query,
            limit=limit,
            scope="nodes",
        )

        summaries = [node.summary for node in result.nodes or[]]
        if not summaries:
            return ["No nodes found for the query."]
        return summaries