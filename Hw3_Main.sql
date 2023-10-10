---------  Q1  ------------- 
select p.name as "Product Name", m.name as "Seller Name", s.quantity_available
from products p
join 
	sell s ON p.pid = s.pid
join 
	merchants m ON s.mid = m.mid
where 
	s.quantity_available = 0;
    
---------  Q2  ------------- 
select p.name as "Product Name", p.description as "Product Description", s.quantity_available
from 
	products p
left join 
	sell s ON p.pid = s.pid
where 
	s.quantity_available IS NULL;
    
---------  Q3 ------------- 
SELECT COUNT(DISTINCT c.cid) AS num_customers
FROM customers c
INNER JOIN place pl ON c.cid = pl.cid
INNER JOIN orders o ON pl.oid = o.oid
INNER JOIN contain ct ON o.oid = ct.oid
INNER JOIN products p ON ct.pid = p.pid
WHERE p.category = 'SATA Drive'
AND c.cid NOT IN (
    SELECT DISTINCT c2.cid
    FROM customers c2
    INNER JOIN place pl2 ON c2.cid = pl2.cid
    INNER JOIN orders o2 ON pl2.oid = o2.oid
    INNER JOIN contain ct2 ON o2.oid = ct2.oid
    INNER JOIN products p2 ON ct2.pid = p2.pid
    WHERE p2.category = 'Router'
);

------ Q4 --------
UPDATE sell
SET price = price * 0.8
WHERE mid IN (SELECT mid FROM merchants WHERE name = 'HP')
  AND pid IN (SELECT pid FROM products WHERE category = 'Networking');
  
------ Q5 -----------------
SELECT c.fullname, m.name, p.name AS "Product Name", s.price
FROM customers c
INNER JOIN place pl ON c.cid = pl.cid
INNER JOIN orders o ON pl.oid = o.oid
INNER JOIN contain co ON o.oid = co.oid
INNER JOIN products p ON co.pid = p.pid
INNER JOIN sell s ON p.pid = s.pid
INNER JOIN merchants m ON s.mid = m.mid
WHERE c.fullname = 'Uriel Whitney' AND m.name = 'Acer';


------ Q6 ---------------
SELECT m.name AS company, YEAR(pl.order_date) AS year, SUM(s.price * s.quantity_available) AS total_sales
FROM merchants m
INNER JOIN sell s ON m.mid = s.mid
INNER JOIN products p ON s.pid = p.pid
INNER JOIN contain c ON p.pid = c.pid
INNER JOIN place pl ON c.oid = pl.oid
GROUP BY m.name, YEAR(pl.order_date)
ORDER BY m.name, YEAR(pl.order_date) desc;



------ Q7 ---------------
select m.name as "Company Name", SUM(s.price *s.quantity_available) as "Total Sales", year(pl.order_date) as "Date"
from merchants m
join sell s ON m.mid = s.mid
join contain c ON s.pid = c.pid
join place pl ON c.oid = pl.oid 
group by m.name, year(pl.order_date)
having SUM(s.price *s.quantity_available) >= all 
	(
    select SUM(s.price *s.quantity_available)
    from merchants m 
    join sell s ON m.mid = s.mid
	join contain c ON s.pid = c.pid
	join place pl ON c.oid = pl.oid 
    group by m.name, year(pl.order_date)
    );
  

    

------ Q8 ---------------
select shipping_method as "Shipping Method", shipping_cost as "Cheapest Shipping Cost"
from orders 
where shipping_cost  = (
			select MIN(shipping_cost)
            from orders
            );

------ Q9 ---------------
SELECT m.name AS company, 
       (SELECT p.category
        FROM sell s
        INNER JOIN products p ON s.pid = p.pid
        WHERE s.mid = m.mid
        GROUP BY p.category
        ORDER BY SUM(s.price * s.quantity_available) DESC
        LIMIT 1) AS best_sold_category
FROM merchants m;

------- Q10-----------------
-- Customers who spent the most for each company
SELECT m.name AS company_name, c.fullname AS customer_name, SUM(s.price * s.quantity_available) AS total_spent
FROM merchants m
JOIN sell s ON m.mid = s.mid
JOIN contain co ON s.pid = co.pid
JOIN orders o ON co.oid = o.oid
JOIN place p ON o.oid = p.oid
JOIN customers c ON p.cid = c.cid
GROUP BY m.mid, c.cid, m.name, c.fullname
HAVING SUM(s.price * s.quantity_available) = (
    SELECT MAX(total_spent)
    FROM (
        SELECT m1.mid AS company_id, c1.cid AS customer_id, SUM(s1.price * s1.quantity_available) AS total_spent
        FROM merchants m1
        JOIN sell s1 ON m1.mid = s1.mid
        JOIN contain co1 ON s1.pid = co1.pid
        JOIN orders o1 ON co1.oid = o1.oid
        JOIN place p1 ON o1.oid = p1.oid
        JOIN customers c1 ON p1.cid = c1.cid
        WHERE m1.mid = m.mid
        GROUP BY m1.mid, c1.cid
    ) AS company_customer_spending
)

UNION ALL

-- Customers who spent the least for each company
SELECT m.name AS company_name, c.fullname AS customer_name, SUM(s.price * s.quantity_available) AS total_spent
FROM merchants m
JOIN sell s ON m.mid = s.mid
JOIN contain co ON s.pid = co.pid
JOIN orders o ON co.oid = o.oid
JOIN place p ON o.oid = p.oid
JOIN customers c ON p.cid = c.cid
GROUP BY m.mid, c.cid, m.name, c.fullname
HAVING SUM(s.price * s.quantity_available) = (
    SELECT MIN(total_spent)
    FROM (
        SELECT m1.mid AS company_id, c1.cid AS customer_id, SUM(s1.price * s1.quantity_available) AS total_spent
        FROM merchants m1
        JOIN sell s1 ON m1.mid = s1.mid
        JOIN contain co1 ON s1.pid = co1.pid
        JOIN orders o1 ON co1.oid = o1.oid
        JOIN place p1 ON o1.oid = p1.oid
        JOIN customers c1 ON p1.cid = c1.cid
        WHERE m1.mid = m.mid
        GROUP BY m1.mid, c1.cid
    ) AS company_customer_spending
)
ORDER BY company_name, total_spent;
