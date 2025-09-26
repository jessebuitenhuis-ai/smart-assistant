from fastmcp import FastMCP
from zep_cloud import AsyncZep
from config import Config

server = FastMCP("smart-assistant")
zep = AsyncZep(api_key=Config.ZEP_API_KEY)

@server.tool
async def search_facts(query: str, limit: int = 5) -> list[str]:
    """Search for facts in all conversations had with the user.
    
    Args:
        query (str): The search query.
        limit (int): The maximum number of results to return.
        
    Returns:
        list: A list of facts that match the query."""
    
    result = await zep.graph.search(
        user_id=Config.USER_NAME,
        query=query,
        limit=limit,
        scope="edges",
    )

    facts = [edge.fact for edge in result.edges or[]]
    if not facts:
        return ["No facts found for the query."]
    return facts

@server.tool
async def search_nodes(query: str, limit: int = 5) -> list[str]:
    """Search for nodes in all conversations had with the user.
    
    Args:
        query (str): The search query.
        limit (int): The maximum number of results to return.
        
    Returns:
        list: A list of nodes that match the query."""
    
    result = await zep.graph.search(
        user_id=Config.USER_NAME,
        query=query,
        limit=limit,
        scope="nodes",
    )

    summaries = [node.summary for node in result.nodes or[]]
    if not summaries:
        return ["No nodes found for the query."]
    return summaries

if __name__ == "__main__":
    server.run(transport="sse", port=4567)