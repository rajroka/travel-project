export default function Reviews() {
  const reviews: {
    name: string;
    rating: number;
    comment: string;
  }[] = [];

  return (
    <section className="mt-10 border-t border-gray-200 pt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          What Explorers Say
        </h2>

        <button className="text-sm font-medium text-blue-700 hover:underline">
          Write a Review
        </button>
      </div>

      {reviews.length === 0 ? (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="font-medium text-gray-700">
            No reviews yet
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Be the first person to review this package.
          </p>

          <button className="mt-4 rounded-lg bg-blue-700 px-5 py-2 text-sm font-medium text-white hover:bg-blue-800">
            Write a Review
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <p className="font-medium text-gray-900">
                {review.name}
              </p>

              <p className="mt-1 text-sm text-orange-500">
                {"★".repeat(review.rating)}
              </p>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}