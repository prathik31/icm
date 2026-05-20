from loguru import logger


def configure_logging(level: str) -> None:
    logger.remove()
    logger.add(
        sink="sys.stdout",
        level=level.upper(),
        format="<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        enqueue=True,
        backtrace=False,
        diagnose=False,
    )
