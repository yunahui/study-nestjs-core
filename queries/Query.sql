SELECT id, title, likeCount
from movie
where likeCount < 20
   OR (likeCount = 20 AND id < 35)
order by likeCount desc, id DESC
limit 5



