---- Q1 ------
select avg(film.length) as 'Average Length', category.name as 'Category'  -- select length and category
from category
join film_category on category.category_id = film_category.film_id  -- connect film_category with category
join film on film_category.film_id = film.film_id                   -- conenct film with film_category
group by category.name												-- group by cateogy name
order by category.name;												-- order alphabetically 


---- Q2 ------
select avg(film.length) as 'Average Length', category.name as 'Category' -- select avg film length and category
from category
join film_category on category.category_id = film_category.film_id   -- join film_category with category
join film on film_category.film_id = film.film_id       -- join film with film_category
group by category.name							-- group by category name
order by avg(film.length) DESC;					-- order by longest film length

select avg(film.length) as 'Average Length', category.name as 'Category'
from category
join film_category on category.category_id = film_category.film_id  
join film on film_category.film_id = film.film_id       
group by category.name
order by avg(film.length) ASC;				-- order by shortest film length

---- Q3 ----
-- Select the first name, last name, and category for customers who rented 'Action' movies
select customer.first_name as 'First Name', customer.last_name as 'Last Name', cat.name as 'Category'
-- From the customer table
from customer
-- Join the rental table on the customer_id to get customer rental information
join rental r on r.customer_id = customer.customer_id
-- Join the inventory table to get information about the rented inventory items
join inventory i on r.inventory_id = i.inventory_id
-- Join the film table to get information about the rented films
join film f on i.film_id = f.film_id
-- Join the film_category table to link films to their categories
join film_category fc on f.film_id = fc.film_id
-- Join the category table to get the category names
join category cat on fc.category_id = cat.category_id
-- Filter the results to only include 'Action' category rentals
where cat.name = 'Action'
-- Use a subquery to check if the customer did not rent 'Comedy' or 'Classic' movies
and not exists (
    select 1
    -- Subquery: Join the rental table again for the same customer
    from rental r2
    join inventory i2 on r2.inventory_id = i2.inventory_id
    join film f2 on i2.film_id = f2.film_id
    join film_category fc2 on f2.film_id = fc2.film_id
    join category cat2 on fc2.category_id = cat2.category_id
    -- Filter the subquery results to check if the customer rented 'Comedy' or 'Classic' movies
    where r2.customer_id = customer.customer_id
    and cat2.name in ('Comedy', 'Classic')
);


--- Q4 ----
-- Select the first name, last name, and count of movies for each actor
SELECT actor.first_name AS 'First Name', actor.last_name AS 'Last Name', count(*) AS movie_count
-- From the actor table
FROM actor
-- Join the film_actor table on the actor's ID
JOIN film_actor ON actor.actor_id = film_actor.actor_id
-- Join the film table on the film ID
JOIN film ON film_actor.film_id = film.film_id
-- Where the language of the film is English
WHERE film.language_id = (
    -- Subquery to get the language ID for English
    SELECT language_id
    FROM language
    WHERE name = 'English'
)
-- Group the results by actor's ID
GROUP BY actor.actor_id
-- Order the results by movie_count in descending order
ORDER BY movie_count DESC;


--- Q5 ----
-- Count the number of distinct inventory IDs representing distinct movies rented
select count(distinct r.inventory_id) as distinct_movies_count
-- From the rental table
from rental r
-- Join the staff table to associate rentals with staff members
join staff s on r.staff_id = s.staff_id
-- Select only rentals handled by a staff member with the first name 'Mike'
where s.first_name = 'Mike'
-- Calculate the number of days between return and rental dates and filter for rentals with exactly 10 days
and datediff(r.return_date, r.rental_date) = 10;


--- Q6 ----
select actor.first_name, actor.last_name, count(film_actor.actor_id) as cast_size_per_actor
from actor
join film_actor on actor.actor_id = film_actor.actor_id
join ( -- Subquery to count the cast size for each film and find the largest cast
    select film_id, count(actor_id) as cast_size
    from film_actor
    group by film_id
    order by cast_size desc
) as largest_cast on film_actor.film_id = largest_cast.film_id
group by actor.actor_id
order by actor.last_name, actor.first_name;
