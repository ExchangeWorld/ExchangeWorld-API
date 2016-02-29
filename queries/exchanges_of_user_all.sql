select
e.eid as eid,
e.status as status,
e.goods_one_agree as goods_one_agree,
e.goods_two_agree as goods_two_agree,

g1.photo_path as "goods_one.photo_path",
g2.photo_path as "goods_two.photo_path",
g1.name as "goods_one.name",
g2.name as "goods_two.name",

u1.photo_path as "goods_one.owner.photo_path",
u2.photo_path as "goods_two.owner.photo_path",
u1.uid as "goods_one.owner.uid",
u2.uid as "goods_two.owner.uid"
u1.uid as "goods_one.owner.name",
u2.uid as "goods_two.owner.name"

from
((((exchanges as e inner join goods as g1 on e.goods_one_gid = g1.gid)
	inner join goods as g2 on e.goods_two_gid = g2.gid)
		inner join users as u1 on g1.owner_uid = u1.uid)
			inner join users as u2 on g2.owner_uid = u2.uid)

where
e.status != 'dropped'
and
g1.deleted = 0
and
g2.deleted = 0
and
(g1.owner_uid = :owner_uid
or
g2.owner_uid = :owner_uid)

order by eid
desc
