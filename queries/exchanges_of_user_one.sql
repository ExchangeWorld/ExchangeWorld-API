select
e.eid as eid,
e.status as status,
e.goods_one_agree as goods_one_agree,
e.goods_two_agree as goods_two_agree,
e.chatroom_cid as chatroom_cid,

g1.gid as "goods_one.gid",
g2.gid as "goods_two.gid",
g1.photo_path as "goods_one.photo_path",
g2.photo_path as "goods_two.photo_path",
g1.name as "goods_one.name",
g2.name as "goods_two.name",
g1.category as "goods_one.category",
g2.category as "goods_two.category",
g1.description as "goods_one.description",
g2.description as "goods_two.description",
g1.position_x as "goods_one.position_x",
g2.position_x as "goods_two.position_x",
g1.position_y as "goods_one.position_y",
g2.position_y as "goods_two.position_y",
g1.rate as "goods_one.rate",
g2.rate as "goods_two.rate",
g1.exchanged as "goods_one.exchanged",
g2.exchanged as "goods_two.exchanged",
g1.deleted as "goods_one.deleted",
g2.deleted as "goods_two.deleted",

u1.photo_path as "goods_one.owner.photo_path",
u2.photo_path as "goods_two.owner.photo_path",
u1.uid as "goods_one.owner.uid",
u2.uid as "goods_two.owner.uid",
u1.name as "goods_one.owner.name",
u2.name as "goods_two.owner.name"

from
((((exchanges as e inner join goods as g1 on e.goods_one_gid = g1.gid)
	inner join goods as g2 on e.goods_two_gid = g2.gid)
		inner join users as u1 on g1.owner_uid = u1.uid)
			inner join users as u2 on g2.owner_uid = u2.uid)

where
e.eid = :eid
and
e.status != 'dropped'
and
g1.deleted = 0
and
g2.deleted = 0
and
(g1.owner_uid = :owner_uid
or
g2.owner_uid = :owner_uid)
